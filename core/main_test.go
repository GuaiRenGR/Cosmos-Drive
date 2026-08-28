package main

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestDecodeRemoteName(t *testing.T) {
	for _, tc := range []struct {
		input string
		want  string
	}{
		{input: "%E4%B8%AD%E6%96%87%20%E6%96%87%E4%BB%B6.txt", want: "中文 文件.txt"},
		{input: "a+b.txt", want: "a+b.txt"},
		{input: "%E6%B5%8B%E8%AF%95%2Fname.txt", want: "测试/name.txt"},
		{input: "%zz.txt", want: "%zz.txt"},
	} {
		if got := decodeRemoteName(tc.input); got != tc.want {
			t.Fatalf("decodeRemoteName(%q) = %q, want %q", tc.input, got, tc.want)
		}
	}
}

func TestParseFTPListDecodesNames(t *testing.T) {
	items := parseFTPList("-rw-r--r-- 1 user group 12 Jan 02 03:04 %E4%B8%AD%E6%96%87.txt\n" +
		"drwxr-xr-x 1 user group 0 Jan 02 03:04 folder%20one\n")
	if len(items) != 2 {
		t.Fatalf("parseFTPList returned %d items, want 2", len(items))
	}
	if items[0].Name != "中文.txt" || items[0].RawName != "%E4%B8%AD%E6%96%87.txt" || items[0].Folder {
		t.Fatalf("unexpected file item: %+v", items[0])
	}
	if items[1].Name != "folder one" || items[1].RawName != "folder%20one" || !items[1].Folder {
		t.Fatalf("unexpected folder item: %+v", items[1])
	}
}

func TestCanonicalDAVPathSkipsMountedRoot(t *testing.T) {
	c := Config{Host: "https://example.test/dav", BasePath: "/"}
	want := "/dav"
	if got := canonicalDAVPath(davURL(c, "/")); got != want {
		t.Fatalf("canonicalDAVPath(request) = %q, want %q", got, want)
	}
	for _, href := range []string{"https://example.test/dav/", "/dav/", "/%64%61%76/", "dav/"} {
		if !sameDAVResource(davURL(c, "/"), href) {
			t.Fatalf("sameDAVResource(%q) did not match mounted root", href)
		}
	}
	if got := canonicalDAVPath("https://example.test/dav/file.txt"); got == want {
		t.Fatalf("file path %q was treated as mounted root", got)
	}
}

func TestDAVListSkipsMountedRootResponse(t *testing.T) {
	var server *httptest.Server
	server = httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "PROPFIND" {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}
		w.Header().Set("Content-Type", "application/xml")
		_, _ = fmt.Fprintf(w, `<?xml version="1.0" encoding="utf-8"?>
<multistatus xmlns="DAV:">
  <response><href>%s/dav/</href><propstat><prop><resourcetype><collection/></resourcetype></prop></propstat></response>
  <response><href>%s/dav/file.txt</href><propstat><prop><getcontentlength>12</getcontentlength></prop></propstat></response>
</multistatus>`, server.URL, server.URL)
	}))
	defer server.Close()

	items, err := davList(Config{Host: server.URL + "/dav", BasePath: "/"}, "/")
	if err != nil {
		t.Fatalf("davList returned error: %v", err)
	}
	if len(items) != 1 || items[0].Name != "file.txt" {
		t.Fatalf("davList returned mounted target: %+v", items)
	}
}
