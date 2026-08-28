package main

import "testing"

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