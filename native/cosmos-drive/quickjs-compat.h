#ifndef COSMOS_DRIVE_QUICKJS_COMPAT_H
#define COSMOS_DRIVE_QUICKJS_COMPAT_H
#include <stdint.h>
#include <stddef.h>
typedef struct JSContext JSContext;
typedef struct JSModuleDef JSModuleDef;
typedef uint64_t JSValue;
typedef JSValue JSValueConst;
typedef JSValue JSCFunction(JSContext *, JSValueConst, int, JSValueConst *);
#define JS_TAG_INT 0
#define JS_TAG_BOOL 1
#define JS_MKVAL(tag, value) (((uint64_t)(tag) << 32) | (uint32_t)(value))
const char *JS_ToCStringLen2(JSContext *, size_t *, JSValueConst, int);
void JS_FreeCString(JSContext *, const char *);
static inline JSValue JS_NewBool(JSContext *ctx, int value) { (void)ctx; return JS_MKVAL(JS_TAG_BOOL, value != 0); }
static inline JSValue JS_NewInt32(JSContext *ctx, int32_t value) { (void)ctx; return JS_MKVAL(JS_TAG_INT, value); }
JSValue JS_NewString(JSContext *, const char *);
JSValue JS_NewObject(JSContext *);
JSValue JS_NewCFunction2(JSContext *, JSCFunction *, const char *, int, int, int);
JSValue JS_ThrowInternalError(JSContext *, const char *, ...);
int JS_SetPropertyStr(JSContext *, JSValueConst, const char *, JSValue);
JSModuleDef *JS_NewCModule(JSContext *, const char *, int (*)(JSContext *, JSModuleDef *));
int JS_AddModuleExport(JSContext *, JSModuleDef *, const char *);
int JS_SetModuleExport(JSContext *, JSModuleDef *, const char *, JSValue);
typedef JSModuleDef *(*LoadCModuleFunction)(JSContext *, const char *);
void registerCModuleLoader(const char *, LoadCModuleFunction);
static inline JSValue JS_NewCFunction(JSContext *c, JSCFunction *f, const char *n, int l) { return JS_NewCFunction2(c, f, n, l, 0, 0); }
#endif
