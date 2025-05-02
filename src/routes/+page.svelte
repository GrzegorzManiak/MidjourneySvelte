<script lang="ts">
	import "../app.css";
	import Swirl from "$lib/swirl.svelte";
    import Figlet from "figlet";

	const textLogo = `
 ██████╗ ██████╗ ███████╗███████╗ ██████╗  ██████╗ ██████╗ ███████╗
██╔════╝ ██╔══██╗╚══███╔╝██╔════╝██╔════╝ ██╔═══██╗██╔══██╗╚══███╔╝
██║  ███╗██████╔╝  ███╔╝ █████╗  ██║  ███╗██║   ██║██████╔╝  ███╔╝
██║   ██║██╔══██╗ ███╔╝  ██╔══╝  ██║   ██║██║   ██║██╔══██╗ ███╔╝
╚██████╔╝██║  ██║███████╗███████╗╚██████╔╝╚██████╔╝██║  ██║███████╗
 ╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚══════╝
`;

	const textLines = [
		"hello, my name is Grzegorz, I am a software engineer",
        "Software Engineer at Mastercard, Building stuff at Entrepreneur First",
        "Bachelor of Science in Computing from Technical University of Dublin",
    ];

	function processLogo(text: string): Array<string> {
		const lines = text.split("\n");
		if (lines.length > 0 && lines[lines.length - 1] === "")
			lines.pop();

		if (lines.length > 0 && lines[0] === "")
            lines.shift();

		const maxLength = Math.max(...lines.map(line => line.length));
		return lines.map(line => {
			const padding = Math.floor((maxLength - line.length));
			return line + " ".repeat(padding);
		});
    }

	function equalizeTextLines(lines: Array<string>, paddingCharacter: string): Array<string> {
		const maxLength = Math.max(...lines.map(line => line.length));
		return lines.map(line => {
			const padding = Math.floor((maxLength - line.length) / 2);
            return paddingCharacter.repeat(padding) + line + paddingCharacter.repeat(padding);
		});
    }

	function getScrambleSourceSet(text: string): string {
        const scrambleSet = new Set<string>();
		for (let i = 0; i < text.length; i++) {
			const char = text[i];
			scrambleSet.add(char);
        }

        scrambleSet.delete("\n");
        scrambleSet.delete("\r");
        scrambleSet.delete(" ");

        return Array.from(scrambleSet).join('');
    }
</script>

<div>
    <Swirl
            revealStyle="lock"
            fillColor="#7af2ff"
            revealDelaySec={1.5}
            lockChance={0.2}
            sourceTextLines={equalizeTextLines(textLines, " ")}
            logoCharacterGrid={processLogo(textLogo)}
            scrambleSourceSet={getScrambleSourceSet(textLogo)}
            style={"w-screen h-screen bg-black"}/>
</div>