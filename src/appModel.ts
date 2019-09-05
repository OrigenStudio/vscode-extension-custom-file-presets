import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { upperFirst } from "lodash";
import * as yup from "yup";

type PresetQuestion = {
  key: string;
  label: string;
  validationSchema?: typeof yup.string;
};

type QuestionsValues = { [key: string]: string };

type Preset = {
  name: string;
  key: string;
  description: string;
  questions?: Array<PresetQuestion>;
  files: (
    values: QuestionsValues
  ) => {
    [path: string]: string;
  };
};

export class AppModel {
  static presets: Preset[] = [];

  presets: Preset[] = [];

  constructor() {
    this.presets = AppModel.presets;
  }

  async createFile(defaultPath?: string) {
    try {
      defaultPath = defaultPath || "/";
      // @ts-ignore
      const projectRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
      if (path.resolve(defaultPath) === defaultPath)
        defaultPath = defaultPath
          .substring(projectRoot.length)
          .replace(/\\/g, "/");

      if (!defaultPath.endsWith("/")) defaultPath += "/";
      const basepath = projectRoot;

      const { relativePath, preset, values } = await askUserForIrcInstance(
        defaultPath,
        this.presets
      );

      if (!relativePath) return;
      if (!preset) return;
      if (!values) return;

      const fullpath = basepath + relativePath;

      const files = await preset.files(values);

      var paths = Object.keys(files).map(file => fullpath + file);

      // @ts-ignore
      var contents = Object.values(files);

      this.makefiles(paths);

      var error = false;

      setTimeout(() => {
        //tiny delay
        var j = 0;
        for (var i = 0; i < paths.length; i++) {
          vscode.workspace.openTextDocument(paths[i]).then(editor => {
            if (!editor) return;
            const htmlContent = contents[j];
            j++;
            fs.writeFile(path.join(editor.fileName), htmlContent, err => {
              if (err) {
                error = true;
                console.error(err);
                return;
              }
            });
          });
        }
        if (!error) {
          vscode.window.showInformationMessage("Preset created");
        } else {
          return vscode.window.showErrorMessage(
            "Failed to create Selected Preset"
          );
        }
      }, 50);
    } catch (error) {
      this.logError(error);
      vscode.window.showErrorMessage(
        "Somthing went wrong! Please report on GitHub"
      );
    }
  }

  makefiles(filepaths: string[]) {
    filepaths.forEach(filepath => this.makeFileSync(filepath));
  }

  makefolders(files: string[]) {
    files.forEach(file => this.makeDirSync(file));
  }

  makeDirSync(dir: string) {
    if (fs.existsSync(dir)) return;
    if (!fs.existsSync(path.dirname(dir))) {
      this.makeDirSync(path.dirname(dir));
    }
    fs.mkdirSync(dir);
  }

  static addPreset(preset: Preset) {
    this.presets.push(preset);
  }

  makeFileSync(filename: string) {
    if (!fs.existsSync(filename)) {
      this.makeDirSync(path.dirname(filename));
      fs.createWriteStream(filename).close();
    }
  }

  findDir(filePath: string) {
    if (!filePath) return null;
    if (fs.statSync(filePath).isFile()) return path.dirname(filePath);

    return filePath;
  }

  logError(error) {
    console.log("==============Error===============");
    console.log(error);
    console.log("===================================");
  }
}

function askUserForValuePath(prompt: string, value: string) {
  let options: vscode.InputBoxOptions = {
    prompt: prompt,
    value: value,
    valueSelection: [100, 100]
  };

  return vscode.window.showInputBox(options);
}

async function askUserForValuePreset(presets) {
  const names = presets.map(
    (preset: { key: string; name: string; description: string }) =>
      preset.key + ": " + preset.name + "(" + preset.description + ")"
  );
  const result = await vscode.window.showQuickPick(names);
  if (!result) {
    return null;
  }
  const presetKey = result.split(":")[0];
  return presets.find(({ key }) => key === presetKey);
}

async function askUserForValueQuestions(
  questions: Array<PresetQuestion>
): Promise<QuestionsValues | void> {
  const ERROR_CODE = Symbol("askUserForValueQuestions_cancelled");

  try {
    return await questions.reduce(async (accP, question) => {
      const acc = await accP;
      const answer = await inputBoxQuestion(question);
      if (typeof answer === "undefined") {
        throw ERROR_CODE;
      }

      return {
        ...acc,
        [question.key]: answer
      };
    }, Promise.resolve({}));
  } catch (error) {
    if (error === ERROR_CODE) {
      return undefined;
    }
    throw error;
  }
}

function inputBoxQuestion({
  validationSchema = yup.string(),
  label
}: PresetQuestion) {
  const required = !!validationSchema
    .describe()
    .tests.find(test => test.name === "required");
  const options: vscode.InputBoxOptions = {
    prompt: `${label}${required ? "(*)" : ""}`,
    validateInput: value => {
      var error = undefined;
      try {
        validationSchema.validateSync(value);
      } catch (validationError) {
        return validationError.errors.map(error => upperFirst(error)).join(" ");
      }

      return error;
    }
  };

  return vscode.window.showInputBox(options);
}

async function askUserForIrcInstance(defaultPath: string, presets: Preset[]) {
  const relativePath = await askUserForValuePath(
    `Add a path for preset (/path/subpath/...)`,
    defaultPath || "/"
  );
  if (!relativePath) return {};

  const preset: Preset | null = await askUserForValuePreset(presets);

  if (!preset) return {};

  return {
    relativePath: relativePath.endsWith("/")
      ? relativePath
      : `${relativePath}/`,
    preset,
    values: preset.questions
      ? await askUserForValueQuestions(preset.questions)
      : {}
  };
}
