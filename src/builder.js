// if (!window.showOpenFilePicker) {
//     console.log("Browser not compatible, try using a modern browser (the latest version of any Chromium browser)");
// }
// const pickerOpts = {
//     types: [
//         {
//             description: "Audio Files",
//             accept: {
//                 "audio/*": [".mpeg", ".mp4", ".ogg", ".wav", ".m4a"],
//             },
//         },
//     ],
//     excludeAcceptAllOption: true,
// };

// let [file] = await showOpenFilePicker(pickerOpts);
// await file.getFile();

// // let dir;
// // dir = await showDirectoryPicker(pickerOpts);
// // loopDir(dir).then(() => {});

// const loopDir = async (dir) => {
//     for await (const entry of dir.values()) {
//         if (entry.kind === "directory") {
//             loopDir(entry);
//         } else if (entry.kind === "file" && (entry.name.endsWith(".mp3") || entry.name.endsWith(".mp4") || entry.name.endsWith(".ogg") || entry.name.endsWith(".wav") || entry.name.endsWith(".m4a"))) {
//             // folder.push(await entry.getFile());
//         }
//     }
//     // f = folder.length;
//     // playF();
// };
