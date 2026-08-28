// ambient declaration: 给 `import { MyModule } from 'myplugin'` 提供类型
// 名字必须和 C++ 的 setModuleExport / JSAPI.cpp 里完全一致
// jsapi 名 == .so 去掉 libjsapi_ 和 .so == JS import 名

declare class MyModuleClass {
  // sync（同步直接拿值）
  static getVersion(): string;

  // promise（await 或 .then）
  static doWork(input: string): Promise<{ success: boolean; output: string }>;
  static doStream(input: string): Promise<boolean>;

  // event subscription（factory 末尾 InitTpl 自动装上的 subscribe/unsubscribe）
  static on(event: 'stream', callback: (data: string) => void): void;
  static off?(event: 'stream', callback: (data: string) => void): void;
}

export const MyModule: MyModuleClass;
export {};