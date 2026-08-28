package main

import (
	"bufio"
	"crypto/tls"
	"encoding/json"
	"encoding/xml"
	"errors"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/textproto"
	"net/url"
	"os"
	"path"
	"runtime"
	"runtime/debug"
	"strconv"
	"strings"
	"time"
)

const configDir = "/userdisk/Favorite/cosmos/drive"
const configFile = configDir + "/connections.json"
const listenAddr = "127.0.0.1:18765"

type Config struct {
	Type     string `json:"type"`
	Name     string `json:"name"`
	Host     string `json:"host"`
	User     string `json:"user"`
	Password string `json:"password"`
	BasePath string `json:"basePath"`
	TLS      bool   `json:"tls"`
}
type Item struct {
	RawName string `json:\"rawName\"`
	Name    string `json:"name"`
	Folder  bool   `json:"folder"`
	Size    int64  `json:"size"`
	ModTime string `json:"modTime"`
}
type davMultiStatus struct {
	Responses []struct {
		Href      string `xml:"href"`
		PropStats []struct {
			Prop struct {
				ResourceType struct {
					Collection *struct{} `xml:"collection"`
				} `xml:"resourcetype"`
				Length   int64  `xml:"getcontentlength"`
				Modified string `xml:"getlastmodified"`
			} `xml:"prop"`
		} `xml:"propstat"`
	} `xml:"response"`
}

func main() {
	runtime.GOMAXPROCS(1)
	debug.SetMemoryLimit(18 << 20)
	debug.SetGCPercent(50)
	if ensureConfigFile() != nil {
		os.Exit(1)
	}
	mux := http.NewServeMux()
	mux.HandleFunc("/health", health)
	mux.HandleFunc("/profiles", profiles)
	mux.HandleFunc("/request", request)
	srv := &http.Server{Addr: listenAddr, Handler: mux, ReadHeaderTimeout: 10 * time.Second}
	if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		os.Exit(1)
	}
}
func writeJSON(w http.ResponseWriter, v any, err error) {
	w.Header().Set("Content-Type", "application/json")
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]any{"ok": false, "error": err.Error()})
		return
	}
	_ = json.NewEncoder(w).Encode(map[string]any{"ok": true, "data": v})
}
func health(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, map[string]any{"address": listenAddr}, nil)
}
func profiles(w http.ResponseWriter, r *http.Request) {
	if r.Method == "POST" {
		var c Config
		if e := json.NewDecoder(r.Body).Decode(&c); e == nil {
			e = saveConfig(c)
			writeJSON(w, nil, e)
			return
		} else {
			writeJSON(w, nil, e)
			return
		}
	}
	if e := ensureConfigFile(); e != nil {
		writeJSON(w, nil, e)
		return
	}
	b, e := os.ReadFile(configFile)
	if e != nil {
		writeJSON(w, nil, e)
		return
	}
	var v []Config
	e = json.Unmarshal(b, &v)
	for i := range v {
		v[i].Password = ""
	}
	writeJSON(w, v, e)
}

type requestBody struct {
	Config      json.RawMessage `json:"config"`
	Operation   string          `json:"operation"`
	RemotePath  string          `json:"remotePath"`
	LocalPath   string          `json:"localPath"`
	Destination string          `json:"destination"`
}

func request(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		writeJSON(w, nil, fmt.Errorf("POST required"))
		return
	}
	var b requestBody
	if e := json.NewDecoder(r.Body).Decode(&b); e != nil {
		writeJSON(w, nil, e)
		return
	}
	c, e := resolveConfig(string(b.Config))
	if e != nil {
		writeJSON(w, nil, e)
		return
	}
	if e = validateRemote(b.RemotePath); e != nil {
		writeJSON(w, nil, e)
		return
	}
	if b.Operation == "move" {
		if e = validateRemote(b.Destination); e != nil {
			writeJSON(w, nil, e)
			return
		}
	}
	var v any
	switch b.Operation {
	case "list":
		if c.Type == "FTP" {
			v, e = ftpList(c, b.RemotePath)
		} else {
			v, e = davList(c, b.RemotePath)
		}
	case "download":
		if e = validateLocal(b.LocalPath); e == nil {
			if c.Type == "FTP" {
				e = ftpFile(c, b.RemotePath, b.LocalPath, false)
			} else {
				e = davFile(c, b.RemotePath, b.LocalPath, false)
			}
		}
	case "upload":
		if e = validateLocal(b.LocalPath); e == nil {
			if c.Type == "FTP" {
				e = ftpFile(c, b.RemotePath, b.LocalPath, true)
			} else {
				e = davFile(c, b.RemotePath, b.LocalPath, true)
			}
		}
	case "mkdir":
		if c.Type == "FTP" {
			e = ftpSimple(c, "MKD "+b.RemotePath, 257, 250)
		} else {
			e = davSimple(c, "MKCOL", b.RemotePath)
		}
	case "delete":
		if c.Type == "FTP" {
			e = ftpSimple(c, "DELE "+b.RemotePath, 250)
		} else {
			e = davSimple(c, "DELETE", b.RemotePath)
		}
	case "move":
		if c.Type == "FTP" {
			e = ftpMove(c, b.RemotePath, b.Destination)
		} else {
			e = davMove(c, b.RemotePath, b.Destination)
		}
	default:
		e = fmt.Errorf("unknown operation %q", b.Operation)
	}
	if e == nil && v == nil {
		v = map[string]any{"operation": b.Operation, "path": b.RemotePath}
	}
	writeJSON(w, v, e)
}
func resolveConfig(raw string) (Config, error) {
	if strings.HasPrefix(raw, "@") {
		return loadConfig(strings.TrimPrefix(raw, "@"))
	}
	var selector string
	if json.Unmarshal([]byte(raw), &selector) == nil && strings.HasPrefix(selector, "@") {
		return loadConfig(strings.TrimPrefix(selector, "@"))
	}
	return decodeConfig(raw)
}
func decodeConfig(raw string) (Config, error) {
	var c Config
	if e := json.Unmarshal([]byte(raw), &c); e != nil {
		return c, e
	}
	c.Type = strings.ToUpper(c.Type)
	if c.Type == "" {
		c.Type = "WEBDAV"
	}
	if c.Host == "" {
		return c, errors.New("host is required")
	}
	if c.BasePath == "" {
		c.BasePath = "/"
	}
	if c.Type != "FTP" && c.Type != "WEBDAV" {
		return c, errors.New("type must be WebDAV or FTP")
	}
	return c, nil
}
func ensureConfigDir() error { return os.MkdirAll(configDir, 0755) }
func ensureConfigFile() error {
	if e := ensureConfigDir(); e != nil {
		return e
	}
	info, e := os.Stat(configFile)
	if e == nil {
		if info.IsDir() {
			return errors.New("connections.json is a directory")
		}
		return nil
	}
	if !os.IsNotExist(e) {
		return e
	}
	tmp := configFile + ".tmp"
	if e = os.WriteFile(tmp, []byte("[]\n"), 0600); e != nil {
		return e
	}
	if e = os.Rename(tmp, configFile); e != nil {
		_ = os.Remove(tmp)
		return e
	}
	return nil
}
func saveConfig(c Config) error {
	if e := ensureConfigDir(); e != nil {
		return e
	}
	var all []Config
	if b, e := os.ReadFile(configFile); e == nil {
		_ = json.Unmarshal(b, &all)
	}
	found := false
	for i := range all {
		if all[i].Name == c.Name {
			all[i] = c
			found = true
		}
	}
	if !found {
		all = append(all, c)
	}
	b, e := json.MarshalIndent(all, "", "  ")
	if e != nil {
		return e
	}
	return os.WriteFile(configFile, b, 0600)
}
func loadConfig(name string) (Config, error) {
	b, e := os.ReadFile(configFile)
	if e != nil {
		return Config{}, e
	}
	var all []Config
	if e = json.Unmarshal(b, &all); e != nil {
		return Config{}, e
	}
	for _, c := range all {
		if c.Name == name {
			return c, nil
		}
	}
	return Config{}, fmt.Errorf("connection %q not found", name)
}
func validateRemote(p string) error {
	if strings.Contains(p, "\\") || strings.Contains(p, "..") {
		return errors.New("invalid remote path")
	}
	return nil
}
func validateLocal(p string) error {
	if p == "" || !strings.HasPrefix(p, "/") {
		return errors.New("local path must be absolute")
	}
	return nil
}
func davURL(c Config, p string) string {
	scheme := "http"
	if c.TLS || strings.HasPrefix(c.Host, "https://") {
		scheme = "https"
	}
	h := strings.TrimPrefix(strings.TrimPrefix(strings.TrimPrefix(c.Host, "https://"), "http://"), "//")
	base := strings.Trim(c.BasePath, "/")
	rel := strings.Trim(p, "/")
	u := scheme + "://" + strings.TrimRight(h, "/") + "/"
	if base != "" {
		u += base + "/"
	}
	return u + rel
}
func davRequest(c Config, m, p string, body io.Reader) (*http.Response, error) {
	req, e := http.NewRequest(m, davURL(c, p), body)
	if e != nil {
		return nil, e
	}
	if c.User != "" {
		req.SetBasicAuth(c.User, c.Password)
	}
	if m == "PROPFIND" {
		req.Header.Set("Depth", "1")
	}
	return (&http.Client{Timeout: 30 * time.Second, Transport: &http.Transport{TLSClientConfig: &tls.Config{InsecureSkipVerify: true}}}).Do(req)
}
func davList(c Config, p string) ([]Item, error) {
	res, e := davRequest(c, "PROPFIND", p, nil)
	if e != nil {
		return nil, e
	}
	defer res.Body.Close()
	if res.StatusCode >= 300 {
		return nil, fmt.Errorf("webdav list: %s", res.Status)
	}
	var ms davMultiStatus
	if e = xml.NewDecoder(res.Body).Decode(&ms); e != nil {
		return nil, e
	}
	out := []Item{}
	for _, r := range ms.Responses {
		if len(r.PropStats) == 0 {
			continue
		}
		raw := path.Base(strings.TrimRight(r.Href, "/"))
		n := decodeRemoteName(raw)
		if n == "" || n == decodeRemoteName(path.Base(strings.TrimRight(p, "/"))) {
			continue
		}
		pr := r.PropStats[0].Prop
		out = append(out, Item{RawName: raw, Name: n, Folder: pr.ResourceType.Collection != nil, Size: pr.Length, ModTime: pr.Modified})
	}
	return out, nil
}

func decodeRemoteName(name string) string {
	decoded, err := url.PathUnescape(name)
	if err != nil {
		return name
	}
	return decoded
}

func davFile(c Config, p, local string, put bool) error {
	if put {
		f, e := os.Open(local)
		if e != nil {
			return e
		}
		defer f.Close()
		res, e := davRequest(c, "PUT", p, f)
		if e != nil {
			return e
		}
		res.Body.Close()
		if res.StatusCode >= 300 {
			return fmt.Errorf("webdav upload: %s", res.Status)
		}
		return nil
	}
	res, e := davRequest(c, "GET", p, nil)
	if e != nil {
		return e
	}
	defer res.Body.Close()
	if res.StatusCode >= 300 {
		return fmt.Errorf("webdav download: %s", res.Status)
	}
	f, e := os.Create(local)
	if e != nil {
		return e
	}
	defer f.Close()
	_, e = io.Copy(f, res.Body)
	return e
}
func davSimple(c Config, m, p string) error {
	res, e := davRequest(c, m, p, nil)
	if e != nil {
		return e
	}
	res.Body.Close()
	if res.StatusCode >= 300 {
		return fmt.Errorf("webdav %s: %s", m, res.Status)
	}
	return nil
}
func davMove(c Config, from, to string) error {
	req, e := http.NewRequest("MOVE", davURL(c, from), nil)
	if e != nil {
		return e
	}
	req.Header.Set("Destination", davURL(c, to))
	if c.User != "" {
		req.SetBasicAuth(c.User, c.Password)
	}
	res, e := (&http.Client{Timeout: 30 * time.Second, Transport: &http.Transport{TLSClientConfig: &tls.Config{InsecureSkipVerify: true}}}).Do(req)
	if e != nil {
		return e
	}
	res.Body.Close()
	if res.StatusCode >= 300 {
		return fmt.Errorf("webdav move: %s", res.Status)
	}
	return nil
}

type ftpClient struct {
	conn net.Conn
	r    *textproto.Reader
	w    *textproto.Writer
}

func ftpOpen(c Config) (*ftpClient, error) {
	h := c.Host
	if !strings.Contains(h, ":") {
		h += ":21"
	}
	conn, e := net.DialTimeout("tcp", h, 10*time.Second)
	if e != nil {
		return nil, e
	}
	f := &ftpClient{conn: conn, r: textproto.NewReader(bufio.NewReader(conn)), w: textproto.NewWriter(bufio.NewWriter(conn))}
	if _, _, e = f.r.ReadResponse(220); e != nil {
		conn.Close()
		return nil, e
	}
	if e = f.cmd("USER "+c.User, 331, 230); e != nil {
		conn.Close()
		return nil, e
	}
	if e = f.cmd("PASS "+c.Password, 230); e != nil {
		conn.Close()
		return nil, e
	}
	if e = f.cmd("TYPE I", 200); e != nil {
		conn.Close()
		return nil, e
	}
	if c.BasePath != "" && c.BasePath != "/" {
		if e = f.cmd("CWD "+c.BasePath, 250); e != nil {
			conn.Close()
			return nil, e
		}
	}
	return f, nil
}
func (f *ftpClient) cmd(line string, codes ...int) error {
	f.w.PrintfLine(line)
	f.w.W.Flush()
	code, _, e := f.r.ReadResponse(0)
	if e != nil {
		return e
	}
	for _, ok := range codes {
		if code == ok {
			return nil
		}
	}
	return fmt.Errorf("ftp %d", code)
}
func (f *ftpClient) pasv() (net.Conn, error) {
	f.w.PrintfLine("PASV")
	f.w.W.Flush()
	code, msg, e := f.r.ReadResponse(0)
	if e != nil || code != 227 {
		return nil, fmt.Errorf("ftp pasv: %v", e)
	}
	a, b := strings.Index(msg, "("), strings.Index(msg, ")")
	if a < 0 || b < 0 {
		return nil, errors.New("invalid PASV response")
	}
	parts := strings.Split(msg[a+1:b], ",")
	if len(parts) != 6 {
		return nil, errors.New("invalid PASV address")
	}
	p1, e1 := strconv.Atoi(parts[4])
	p2, e2 := strconv.Atoi(parts[5])
	if e1 != nil || e2 != nil {
		return nil, errors.New("invalid PASV port")
	}
	return net.DialTimeout("tcp", fmt.Sprintf("%s.%s.%s.%s:%d", parts[0], parts[1], parts[2], parts[3], p1*256+p2), 10*time.Second)
}
func (f *ftpClient) close() { _ = f.cmd("QUIT", 221); f.conn.Close() }
func ftpList(c Config, p string) ([]Item, error) {
	f, e := ftpOpen(c)
	if e != nil {
		return nil, e
	}
	defer f.close()
	d, e := f.pasv()
	if e != nil {
		return nil, e
	}
	if e = f.cmd("LIST "+p, 150, 125); e != nil {
		return nil, e
	}
	data, _ := io.ReadAll(d)
	d.Close()
	_, _, _ = f.r.ReadResponse(226)
	return parseFTPList(string(data)), nil
}
func parseFTPList(raw string) []Item {
	out := []Item{}
	for _, line := range strings.Split(strings.TrimSpace(raw), "\n") {
		line = strings.TrimSpace(line)
		fields := strings.Fields(line)
		if len(fields) < 9 {
			continue
		}
		size, _ := strconv.ParseInt(fields[4], 10, 64)
		rawName := strings.Join(fields[8:], " ")
		name := decodeRemoteName(rawName)
		out = append(out, Item{RawName: rawName, Name: name, Folder: strings.HasPrefix(fields[0], "d"), Size: size, ModTime: strings.Join(fields[5:8], " ")})
	}
	return out
}
func ftpFile(c Config, p, local string, put bool) error {
	f, e := ftpOpen(c)
	if e != nil {
		return e
	}
	defer f.close()
	d, e := f.pasv()
	if e != nil {
		return e
	}
	if put {
		src, e := os.Open(local)
		if e != nil {
			return e
		}
		defer src.Close()
		if e = f.cmd("STOR "+p, 150, 125); e != nil {
			return e
		}
		_, e = io.Copy(d, src)
		d.Close()
		_, _, _ = f.r.ReadResponse(226)
		return e
	}
	if e = f.cmd("RETR "+p, 150, 125); e != nil {
		return e
	}
	dst, e := os.Create(local)
	if e != nil {
		return e
	}
	_, e = io.Copy(dst, d)
	dst.Close()
	d.Close()
	_, _, _ = f.r.ReadResponse(226)
	return e
}
func ftpSimple(c Config, cmd string, codes ...int) error {
	f, e := ftpOpen(c)
	if e != nil {
		return e
	}
	defer f.close()
	return f.cmd(cmd, codes...)
}
func ftpMove(c Config, from, to string) error {
	f, e := ftpOpen(c)
	if e != nil {
		return e
	}
	defer f.close()
	if e = f.cmd("RNFR "+from, 350); e != nil {
		return e
	}
	return f.cmd("RNTO "+to, 250)
}