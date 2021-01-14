import * as chalk from "chalk";
import * as os from "os";
import * as tty from "tty";


const emptyDisposable = {
    dispose: () => { return; }
};

const constants = (os as any).constants; // not present in node4 and mis-typed in node6
const sigint: number = (constants && constants.signals && typeof constants.signals.SIGINT === "number"
    ? constants.signals.SIGINT
    : 2);

/**
 * Exit code returned when SIGINT causes termination.
 *
 * As per node docs[0], will be 128 + value of SIGINT (or 2
 * if not available).
 *
 * [0]: https://nodejs.org/dist/latest-v6.x/docs/api/process.html#process_exit_codes
 */
export const sigintExitCode = 128 + sigint;

/**
 * Object that releases resources when "dispose" is invoked.
 */
export interface Disposable {
    /**
     * Releases any resources held by the implementing object.
     */
    dispose(): void;
}

/**
 * Prints a message indicating Ctrl+C was pressed then exits the process.
 *
 * Exit code will be value of "sigintExitCode".
 */
export function defaultCtrlCHandler(): void {
    console.log(`'${chalk.cyan("^C")}', exiting`);
    process.exit(sigintExitCode);
}

/**
 * Monitors Ctrl+C and executes a callback instead of SIGINT.
 *
 * When invoked, this listens to keypresses on STDIN,
 * which prevents normal process termination. To ensure
 * your program terminates properly if Ctrl+C is NOT
 * pressed, call the "dispose" method on the object
 * returned by this function when your process is
 * completed.
 *
 * NOTE: This should only be used by programs that do
 * not normally read from STDIN.
 *
 * @param {Function} onCtrlC
 *     Callback function to execute on Ctrl+C.
 *     @default "defaultCtrlCHandler"
 * @returns
 *     Disposable object that restores STDIN to its previous
 *     state, allowing for proper process termination.
 */
export function monitorCtrlC(onCtrlC: () => any = defaultCtrlCHandler): Disposable {
    function monitorCtrlCOnData(data: Buffer): void {
        if (data.length === 1 && data[0] === 0x03) { // Ctrl+C
            onCtrlC();
        }
    }

    const stdin = process.stdin as tty.ReadStream;
    if (stdin && stdin.isTTY) {
        stdin.setRawMode(true);
        stdin.on("data", monitorCtrlCOnData);

        return {
            dispose: () => {
                stdin.removeListener("data", monitorCtrlCOnData);
                stdin.setRawMode(false);
                stdin.pause();
            }
        };
    }

    return emptyDisposable;
}
