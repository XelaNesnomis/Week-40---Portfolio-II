import { ANSI } from "./ansi.mjs";
const ART = `
${ANSI.COLOR.BLUE} ______  ____   __      ______   ____    __      ______   ___     ___
${ANSI.COLOR.BLUE}|      ||    | /  ]    |      | /    |  /  ]    |      | /   \\   /  _]${ANSI.RESET}
${ANSI.COLOR.YELLOW}|      | |  | /  /     |      ||  o  | /  /     |      ||     | /  [_${ANSI.RESET}
${ANSI.COLOR.YELLOW}|_|  |_| |  |/  /      |_|  |_||     |/  /      |_|  |_||  O  ||    _]${ANSI.RESET}
${ANSI.COLOR.GREEN}  |  |   |  /   \\_       |  |  |  _  /   \\_       |  |  |     ||   [_${ANSI.RESET}
${ANSI.COLOR.GREEN}  |  |   |  \\     |      |  |  |  |  \\     |      |  |  |     ||     |${ANSI.RESET}
${ANSI.COLOR.RED}  |__|  |____\\____|      |__|  |__|__|\\____|      |__|   \\___/ |_____|${ANSI.RESET}

${ANSI.COLOR.BLUE}                            xD :3 ^.^ :P >:D${ANSI.RESET}

`

function showSplashScreen() {
    console.log(ART);
}

export default showSplashScreen;