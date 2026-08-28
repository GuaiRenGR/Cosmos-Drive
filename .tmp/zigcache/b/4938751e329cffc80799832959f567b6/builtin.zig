const std = @import("std");
/// Zig version. When writing code that supports multiple versions of Zig, prefer
/// feature detection (i.e. with `@hasDecl` or `@hasField`) over version checks.
pub const zig_version = std.SemanticVersion.parse(zig_version_string) catch unreachable;
pub const zig_version_string = "0.13.0";
pub const zig_backend = std.builtin.CompilerBackend.stage2_llvm;

pub const output_mode = std.builtin.OutputMode.Lib;
pub const link_mode = std.builtin.LinkMode.static;
pub const is_test = false;
pub const single_threaded = false;
pub const abi = std.Target.Abi.musleabihf;
pub const cpu: std.Target.Cpu = .{
    .arch = .arm,
    .model = &std.Target.arm.cpu.cortex_a7,
    .features = std.Target.arm.featureSet(&[_]std.Target.arm.Feature{
        .aclass,
        .d32,
        .db,
        .dsp,
        .fp16,
        .fp64,
        .fpregs,
        .fpregs64,
        .has_v4t,
        .has_v5t,
        .has_v5te,
        .has_v6,
        .has_v6k,
        .has_v6m,
        .has_v6t2,
        .has_v7,
        .has_v7clrex,
        .has_v8m,
        .hwdiv,
        .hwdiv_arm,
        .mp,
        .neon,
        .perfmon,
        .ret_addr_stack,
        .slow_fp_brcc,
        .slowfpvfmx,
        .slowfpvmlx,
        .thumb2,
        .trustzone,
        .v7a,
        .vfp2,
        .vfp2sp,
        .vfp3,
        .vfp3d16,
        .vfp3d16sp,
        .vfp3sp,
        .vfp4,
        .vfp4d16,
        .vfp4d16sp,
        .vfp4sp,
        .virtualization,
        .vmlx_forwarding,
        .vmlx_hazards,
    }),
};
pub const os = std.Target.Os{
    .tag = .linux,
    .version_range = .{ .linux = .{
        .range = .{
            .min = .{
                .major = 4,
                .minor = 19,
                .patch = 0,
            },
            .max = .{
                .major = 6,
                .minor = 5,
                .patch = 7,
            },
        },
        .glibc = .{
            .major = 2,
            .minor = 28,
            .patch = 0,
        },
    }},
};
pub const target: std.Target = .{
    .cpu = cpu,
    .os = os,
    .abi = abi,
    .ofmt = object_format,
    .dynamic_linker = std.Target.DynamicLinker.init("/lib/ld-musl-armhf.so.1"),
};
pub const object_format = std.Target.ObjectFormat.elf;
pub const mode = std.builtin.OptimizeMode.ReleaseFast;
pub const link_libc = false;
pub const link_libcpp = false;
pub const have_error_return_tracing = false;
pub const valgrind_support = false;
pub const sanitize_thread = false;
pub const position_independent_code = true;
pub const position_independent_executable = false;
pub const strip_debug_info = false;
pub const code_model = std.builtin.CodeModel.default;
pub const omit_frame_pointer = false;
