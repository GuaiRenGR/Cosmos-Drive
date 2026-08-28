#include <errno.h>
#include <dirent.h>
#include <fcntl.h>
#include <limits.h>
#include <signal.h>
#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <sys/stat.h>
#include <sys/types.h>
#include <unistd.h>
#include "quickjs-compat.h"

#define MODULE_NAME "cosmos_drive"
#define APP_ID "8001787877932650"
#define CORE_NAME "cosmos-drive-core"
#define MODULE_FILE_PREFIX "libjsapi_cosmos_drive"
#define PID_FILE "/tmp/cosmos-drive-core.pid"
#define CONFIG_DIR "/userdisk/Favorite/cosmos/drive"
#define CONFIG_FILE CONFIG_DIR "/connections.json"

static const char *const package_roots[] = {
    "/userdata/miniapp/data/mini_app/pkg/",
    "/userdisk/miniapp/data/mini_app/pkg/",
    "/userdisk/secondary/miniapp/data/mini_app/pkg/",
    "/etc/miniapp/data/mini_app/pkgs/",
};

static int path_is_in_app(const char *p) {
    char prefix[PATH_MAX];
    size_t i;
    if (p == NULL || p[0] != '/') return 0;
    for (i = 0; i < sizeof(package_roots) / sizeof(package_roots[0]); i++) {
        int n = snprintf(prefix, sizeof(prefix), "%s%s/", package_roots[i], APP_ID);
        if (n > 0 && (size_t)n < sizeof(prefix) && strncmp(p, prefix, (size_t)n) == 0) return 1;
    }
    return 0;
}

static int valid_core(const char *p) {
    const char *n = p ? strrchr(p, '/') : NULL;
    size_t length;
    if (!n || strcmp(n + 1, CORE_NAME) != 0 || !path_is_in_app(p)) return 0;
    length = strlen(p);
    if (length >= strlen("/libs/arm/") + strlen(CORE_NAME) &&
        strcmp(p + length - strlen("/libs/arm/") - strlen(CORE_NAME), "/libs/arm/" CORE_NAME) == 0) return 1;
    return length >= strlen("/libs/") + strlen(CORE_NAME) &&
        strcmp(p + length - strlen("/libs/") - strlen(CORE_NAME), "/libs/" CORE_NAME) == 0;
}

static int usable_core(const char *candidate, char output[PATH_MAX]) {
    if (access(candidate, F_OK) != 0 || !valid_core(candidate)) return -1;
    if (strlen(candidate) >= PATH_MAX) { errno = ENAMETOOLONG; return -1; }
    strcpy(output, candidate);
    return 0;
}

static int core_from_directory(const char *directory, char output[PATH_MAX]) {
    static const char *const suffixes[] = { "/libs/arm/" CORE_NAME, "/libs/" CORE_NAME };
    char candidate[PATH_MAX];
    size_t i;
    for (i = 0; i < sizeof(suffixes) / sizeof(suffixes[0]); i++) {
        int n = snprintf(candidate, sizeof(candidate), "%s%s", directory, suffixes[i]);
        if (n > 0 && (size_t)n < sizeof(candidate) && usable_core(candidate, output) == 0) return 0;
    }
    errno = ENOENT;
    return -1;
}

static int core_from_library_directory(const char *directory, char output[PATH_MAX]) {
    char candidate[PATH_MAX];
    int n = snprintf(candidate, sizeof(candidate), "%s%s", directory, CORE_NAME);
    if (n > 0 && (size_t)n < sizeof(candidate) && usable_core(candidate, output) == 0) return 0;
    errno = ENOENT;
    return -1;
}

static int installed_core(char output[PATH_MAX]) {
    size_t root_index;
    for (root_index = 0; root_index < sizeof(package_roots) / sizeof(package_roots[0]); root_index++) {
        char app_directory[PATH_MAX];
        int n = snprintf(app_directory, sizeof(app_directory), "%s%s", package_roots[root_index], APP_ID);
        DIR *directory;
        struct dirent *entry;
        if (n <= 0 || (size_t)n >= sizeof(app_directory)) continue;
        if (core_from_directory(app_directory, output) == 0) return 0;
        directory = opendir(app_directory);
        if (directory == NULL) continue;
        while ((entry = readdir(directory)) != NULL) {
            char slot[PATH_MAX];
            if (entry->d_name[0] == '.') continue;
            n = snprintf(slot, sizeof(slot), "%s/%s", app_directory, entry->d_name);
            if (n > 0 && (size_t)n < sizeof(slot) && core_from_directory(slot, output) == 0) {
                closedir(directory);
                return 0;
            }
        }
        closedir(directory);
    }
    errno = ENOENT; return -1;
}

static int find_core(char out[PATH_MAX]) {
    FILE *maps = fopen("/proc/self/maps", "r");
    char line[PATH_MAX + 128];
    if (maps) {
        while (fgets(line, sizeof(line), maps)) {
            char *module = strstr(line, MODULE_FILE_PREFIX);
            char *path;
            char directory[PATH_MAX];
            size_t directory_length;
            if (!module) continue;
            path = strchr(line, '/');
            if (!path || module < path) continue;
            directory_length = (size_t)(module - path);
            if (directory_length >= sizeof(directory)) continue;
            memcpy(directory, path, directory_length);
            directory[directory_length] = '\0';
            if (core_from_library_directory(directory, out) == 0) { fclose(maps); return 0; }
        }
        fclose(maps);
    }
    return installed_core(out);
}

static int ensure_config_file(void) {
    int fd;
    const char initial[] = "[]\n";
    ssize_t written;
    size_t offset = 0;
    if (mkdir("/userdisk", 0700) != 0 && errno != EEXIST) return -1;
    if (mkdir("/userdisk/Favorite", 0700) != 0 && errno != EEXIST) return -1;
    if (mkdir("/userdisk/Favorite/cosmos", 0700) != 0 && errno != EEXIST) return -1;
    if (mkdir(CONFIG_DIR, 0700) != 0 && errno != EEXIST) return -1;
    fd = open(CONFIG_FILE, O_WRONLY | O_CREAT | O_EXCL, 0600);
    if (fd < 0 && errno == EEXIST) return 0;
    if (fd < 0) return -1;
    while (offset < sizeof(initial) - 1) {
        written = write(fd, initial + offset, sizeof(initial) - 1 - offset);
        if (written < 0 && errno == EINTR) continue;
        if (written <= 0) break;
        offset += (size_t)written;
    }
    if (offset != sizeof(initial) - 1 || close(fd) != 0) {
        int error = errno == 0 ? EIO : errno;
        close(fd);
        errno = error;
        return -1;
    }
    return 0;
}
static int read_pid(void) { FILE *f=fopen(PID_FILE,"r"); long p=0; if(f){fscanf(f,"%ld",&p);fclose(f);} return p>1&&p<INT_MAX?(int)p:0; }
static int process_is_core(int pid) {
    char proc_path[64];
    char target[PATH_MAX];
    ssize_t length;
    snprintf(proc_path, sizeof(proc_path), "/proc/%d/exe", pid);
    length = readlink(proc_path, target, sizeof(target) - 1);
    if (length <= 0 || (size_t)length >= sizeof(target)) return 0;
    target[length] = '\0';
    return valid_core(target);
}
static int running(void) { int p=read_pid(); if(!p || !process_is_core(p)) return 0; if(kill(p,0)!=0 && errno!=EPERM) return 0; return p; }
static JSValue status(JSContext *ctx, JSValueConst t, int a, JSValueConst *v) { (void)t;(void)a;(void)v; JSValue o=JS_NewObject(ctx); int p=running(); JS_SetPropertyStr(ctx,o,"running",JS_NewBool(ctx,p)); JS_SetPropertyStr(ctx,o,"pid",JS_NewInt32(ctx,p)); return o; }
static void silence(void) { int f=open("/dev/null",O_RDWR); if(f>=0){dup2(f,0);dup2(f,1);dup2(f,2);if(f>2)close(f);} }
static JSValue ensure_config(JSContext *ctx, JSValueConst t, int a, JSValueConst *v) {
    (void)t; (void)a; (void)v;
    if (ensure_config_file() != 0) {
        return JS_ThrowInternalError(ctx, "cannot initialize config file: %s", strerror(errno));
    }
    return JS_NewBool(ctx, 1);
}
static JSValue start(JSContext *ctx, JSValueConst t, int a, JSValueConst *v) {
    char core[PATH_MAX];
    int exec_error[2];
    int child_errno = 0;
    ssize_t count;
    pid_t pid;
    FILE *pid_file;
    (void)t; (void)a; (void)v;
    if(ensure_config_file()!=0) return JS_ThrowInternalError(ctx,"cannot initialize config file: %s",strerror(errno));
    if(running()) return status(ctx,t,a,v);
    if(find_core(core)!=0) return JS_ThrowInternalError(ctx,"cannot locate bundled core: %s",strerror(errno));
    if(chmod(core,0700)!=0) return JS_ThrowInternalError(ctx,"cannot make core executable: %s",strerror(errno));
    if(pipe(exec_error)!=0) return JS_ThrowInternalError(ctx,"pipe failed: %s",strerror(errno));
    if(fcntl(exec_error[1],F_SETFD,FD_CLOEXEC)!=0) { close(exec_error[0]); close(exec_error[1]); return JS_ThrowInternalError(ctx,"fcntl failed: %s",strerror(errno)); }
    pid=fork();
    if(pid<0) { close(exec_error[0]); close(exec_error[1]); return JS_ThrowInternalError(ctx,"fork failed: %s",strerror(errno)); }
    if(pid==0) {
        close(exec_error[0]);
        if(setsid()<0) { child_errno=errno; write(exec_error[1],&child_errno,sizeof(child_errno)); _exit(125); }
        silence();
        execl(core,core,NULL);
        child_errno=errno;
        write(exec_error[1],&child_errno,sizeof(child_errno));
        _exit(127);
    }
    close(exec_error[1]);
    do { count=read(exec_error[0],&child_errno,sizeof(child_errno)); } while(count<0 && errno==EINTR);
    close(exec_error[0]);
    if(count>0) return JS_ThrowInternalError(ctx,"cannot execute core: %s",strerror(child_errno));
    if(count<0) return JS_ThrowInternalError(ctx,"cannot verify core start: %s",strerror(errno));
    pid_file=fopen(PID_FILE,"w");
    if(!pid_file) { kill(pid,SIGTERM); return JS_ThrowInternalError(ctx,"cannot write PID file: %s",strerror(errno)); }
    fprintf(pid_file,"%d\n",(int)pid);
    fclose(pid_file);
    return status(ctx,t,a,v);
}
static JSValue stop(JSContext *ctx, JSValueConst t, int a, JSValueConst *v) { (void)t;(void)a;(void)v; int p=running(); if(p && kill(p,SIGTERM)!=0 && errno!=ESRCH) return JS_ThrowInternalError(ctx,"stop failed: %s",strerror(errno)); unlink(PID_FILE); return status(ctx,t,a,v); }
static int init(JSContext *ctx, JSModuleDef *m) {
    if(JS_SetModuleExport(ctx,m,"start",JS_NewCFunction(ctx,start,"start",0))<0)return -1;
    if(JS_SetModuleExport(ctx,m,"stop",JS_NewCFunction(ctx,stop,"stop",0))<0)return -1;
    if(JS_SetModuleExport(ctx,m,"status",JS_NewCFunction(ctx,status,"status",0))<0)return -1;
    return JS_SetModuleExport(ctx,m,"ensureConfig",JS_NewCFunction(ctx,ensure_config,"ensureConfig",0));
}
static JSModuleDef *load(JSContext *ctx,const char *name){if(strcmp(name,MODULE_NAME)!=0)return NULL;JSModuleDef*m=JS_NewCModule(ctx,name,init);if(!m)return NULL;JS_AddModuleExport(ctx,m,"start");JS_AddModuleExport(ctx,m,"stop");JS_AddModuleExport(ctx,m,"status");JS_AddModuleExport(ctx,m,"ensureConfig");return m;}
__attribute__((visibility("default"))) void custom_init_jsapis(void){registerCModuleLoader(MODULE_NAME,load);}
