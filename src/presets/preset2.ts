import {AppModel} from '../appModel';

AppModel.addPreset ({
    name: "NemPreset2",
    key: "KeyPreset2",
    description: "descripció del segon preset",
    files: () => ({
        "preset2/preset2.jsx": "text dintre",
        "file2.jsx": "text dintre"
    })
});
