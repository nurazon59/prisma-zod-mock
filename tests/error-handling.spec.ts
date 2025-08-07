import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generate } from '../src/generator/generator-handler';
import { createMockGeneratorOptionsWithDeepMerge, createMockModel } from './helpers/test-helpers';
import * as fs from 'fs/promises';
import * as path from 'path';

vi.mock('fs/promises');
vi.mock('path', async () => {
  const actual = await vi.importActual<typeof import('path')>('path');
  return {
    ...actual,
    join: vi.fn((...args) => actual.join(...args)),
    resolve: vi.fn((...args) => actual.resolve(...args)),
  };
});

describe('エラーハンドリング', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('無効な設定', () => {
    it('出力ディレクトリが指定されていない場合にエラーを投げる', async () => {
      const options = createMockGeneratorOptionsWithDeepMerge({ output: null });

      await expect(generate(options)).rejects.toThrow('No output was specified for generator');
    });

    it('無効なJSONを含む設定を警告付きで処理する', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const options = createMockGeneratorOptionsWithDeepMerge({
        config: {
          customDefaults: '{invalid json}',
          multipleFiles: 'true',
        },
      });

      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue();
      vi.mocked(path.join).mockImplementation((...args) => args.join('/'));

      await generate(options);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to parse customDefaults')
      );
    });

    it('無効なブール値設定をデフォルト値で処理する', async () => {
      const options = createMockGeneratorOptionsWithDeepMerge({
        config: {
          createMockFactories: 'invalid-boolean',
          semanticAnalysis: 'not-a-boolean',
        },
      });

      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue();
      vi.mocked(path.join).mockImplementation((...args) => args.join('/'));

      await generate(options);

      // デフォルト値でフォールバックして成功することを確認
      expect(fs.writeFile).toHaveBeenCalled();
    });
  });

  describe('ファイルシステムエラー', () => {
    it('ディレクトリ作成権限エラーを処理する', async () => {
      const options = createMockGeneratorOptionsWithDeepMerge();

      vi.mocked(fs.mkdir).mockRejectedValue(new Error('EACCES: permission denied'));
      vi.mocked(path.join).mockImplementation((...args) => args.join('/'));

      await expect(generate(options)).rejects.toThrow('EACCES: permission denied');
    });

    it('ファイル書き込みエラーを処理する', async () => {
      const options = createMockGeneratorOptionsWithDeepMerge();

      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockRejectedValue(new Error('ENOSPC: no space left on device'));
      vi.mocked(path.join).mockImplementation((...args) => args.join('/'));

      await expect(generate(options)).rejects.toThrow('ENOSPC: no space left on device');
    });

    it('既存ディレクトリへの書き込みを正常に処理する', async () => {
      const options = createMockGeneratorOptionsWithDeepMerge();

      vi.mocked(fs.mkdir).mockRejectedValue({ code: 'EEXIST' });
      vi.mocked(fs.writeFile).mockResolvedValue();
      vi.mocked(path.join).mockImplementation((...args) => args.join('/'));

      // EEXISTエラーは無視して続行することを確認
      await generate(options);

      expect(fs.writeFile).toHaveBeenCalled();
    });
  });

  describe('無効なスキーマ処理', () => {
    it('フィールドのないモデルを処理する', async () => {
      const emptyModel = createMockModel('EmptyModel', []);

      const options = createMockGeneratorOptionsWithDeepMerge(undefined, {
        datamodel: {
          models: [emptyModel],
          enums: [],
          types: [],
          indexes: [],
        },
      });

      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue();
      vi.mocked(path.join).mockImplementation((...args) => args.join('/'));

      await generate(options);

      const writeCall = vi.mocked(fs.writeFile).mock.calls[0];
      const content = writeCall[1] as string;

      // 空のモデルでも正常に生成されることを確認
      expect(content).toContain('EmptyModel');
    });

    it('循環参照を含むモデルを処理する', async () => {
      const userModel = createMockModel('User', [
        { name: 'id', type: 'String', isId: true },
        { name: 'bestFriend', type: 'User', kind: 'object' },
        { name: 'friends', type: 'User', kind: 'object', isList: true },
      ]);

      const options = createMockGeneratorOptionsWithDeepMerge(undefined, {
        datamodel: {
          models: [userModel],
          enums: [],
          types: [],
          indexes: [],
        },
      });

      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue();
      vi.mocked(path.join).mockImplementation((...args) => args.join('/'));

      await generate(options);

      // 循環参照があってもエラーなく生成されることを確認
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it('不正なフィールドタイプを持つモデルを処理する', async () => {
      const model = createMockModel('InvalidModel', [
        { name: 'id', type: 'String', isId: true },
        { name: 'unknownField', type: 'UnknownType' },
        { name: 'invalidField', type: '' }, // 空文字列として処理
      ]);

      const options = createMockGeneratorOptionsWithDeepMerge(undefined, {
        datamodel: {
          models: [model],
          enums: [],
          types: [],
          indexes: [],
        },
      });

      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue();
      vi.mocked(path.join).mockImplementation((...args) => args.join('/'));

      await generate(options);

      // 不正なフィールドがあっても生成が完了することを確認
      expect(fs.writeFile).toHaveBeenCalled();
    });
  });

  describe('アノテーションパースエラー', () => {
    it('不正な@mockアノテーションをフォールバックで処理する', async () => {
      const model = createMockModel('User', [
        {
          name: 'badField',
          type: 'String',
          documentation: '/// @mock faker.{invalid}.{syntax}()',
        },
        {
          name: 'incompleteField',
          type: 'String',
          documentation: '/// @mock faker.person.',
        },
      ]);

      const options = createMockGeneratorOptionsWithDeepMerge(undefined, {
        datamodel: {
          models: [model],
          enums: [],
          types: [],
          indexes: [],
        },
      });

      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue();
      vi.mocked(path.join).mockImplementation((...args) => args.join('/'));

      await generate(options);

      const writeCall = vi.mocked(fs.writeFile).mock.calls[0];
      const content = writeCall[1] as string;

      // 不正なアノテーションでもフォールバックして生成されることを確認
      expect(content).toContain('badField');
      expect(content).toContain('incompleteField');
    });

    it('不完全な範囲アノテーションを処理する', async () => {
      const model = createMockModel('Product', [
        {
          name: 'price',
          type: 'Int',
          documentation: '/// @mock.range(100)', // maxが欠落
        },
        {
          name: 'quantity',
          type: 'Int',
          documentation: '/// @mock.range()', // 両方欠落
        },
      ]);

      const options = createMockGeneratorOptionsWithDeepMerge(undefined, {
        datamodel: {
          models: [model],
          enums: [],
          types: [],
          indexes: [],
        },
      });

      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue();
      vi.mocked(path.join).mockImplementation((...args) => args.join('/'));

      await generate(options);

      // 不完全なrangeでもフォールバックすることを確認
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it('不正なパターンアノテーションを処理する', async () => {
      const model = createMockModel('Validation', [
        {
          name: 'pattern',
          type: 'String',
          documentation: '/// @mock.pattern("[invalid regex")', // 不正な正規表現
        },
      ]);

      const options = createMockGeneratorOptionsWithDeepMerge(undefined, {
        datamodel: {
          models: [model],
          enums: [],
          types: [],
          indexes: [],
        },
      });

      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue();
      vi.mocked(path.join).mockImplementation((...args) => args.join('/'));

      await generate(options);

      // 不正なパターンでもフォールバックすることを確認
      expect(fs.writeFile).toHaveBeenCalled();
    });
  });

  describe('設定の組み合わせエラー', () => {
    it('複数ファイル出力で出力ディレクトリが無効な場合を処理する', async () => {
      const model = createMockModel('TestModel', [{ name: 'id', type: 'String', isId: true }]);

      const options = createMockGeneratorOptionsWithDeepMerge(
        {
          config: {
            multipleFiles: 'true',
          },
          output: { value: '', fromEnvVar: null }, // 空の出力パス
        },
        {
          datamodel: {
            models: [model],
            enums: [],
            types: [],
            indexes: [],
          },
        }
      );

      vi.mocked(path.join).mockImplementation((...args) => args.join('/'));

      await expect(generate(options)).rejects.toThrow();
    });

    it('深いリレーション深度での無限ループを防ぐ', async () => {
      const model = createMockModel('RecursiveModel', [
        { name: 'id', type: 'String', isId: true },
        { name: 'parent', type: 'RecursiveModel', kind: 'object' },
        { name: 'children', type: 'RecursiveModel', kind: 'object', isList: true },
      ]);

      const options = createMockGeneratorOptionsWithDeepMerge(
        {
          config: {
            defaultRelationDepth: '100', // 極端に深い深度
          },
        },
        {
          datamodel: {
            models: [model],
            enums: [],
            types: [],
            indexes: [],
          },
        }
      );

      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue();
      vi.mocked(path.join).mockImplementation((...args) => args.join('/'));

      await generate(options);

      // 深い深度でも無限ループにならずに生成されることを確認
      expect(fs.writeFile).toHaveBeenCalled();
    });
  });
});
