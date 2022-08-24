<script>
    import svelteLogo from "./assets/svelte.svg";
    import Counter from "./lib/Counter.svelte";
    import { hasFileSystemAccess, getFile } from "../../Browser-file-system-access-helper";

    const loopDir = async (dir) => {
        for await (const entry of dir.values()) {
            console.log(dir.values());
            // if (entry.kind === "directory") {
            //     console.log("Directory:", entry.name);
            //     loopDir(entry);
            // } else if (
            //     entry.kind === "file" &&
            //     (entry.name.endsWith(".mp3") || entry.name.endsWith(".mp4") || entry.name.endsWith(".ogg") || entry.name.endsWith(".wav") || entry.name.endsWith(".m4a"))
            // ) {
            //     // folder.push(await entry.getFile());
            // }
        }
        // f = folder.length;
        // playF();
    };
    const tests = async () => {
        if (hasFileSystemAccess()) {
            // let dir;
            // dir = await showDirectoryPicker();
            // console.log(dir);
            // loopDir(dir).then(() => {});
            let file = getFile().then((e) => {
                console.log(e);
            });
        }
    };
</script>

<aside class="files">
    <button on:click={tests}>open</button>
</aside>
>

<style>
</style>
