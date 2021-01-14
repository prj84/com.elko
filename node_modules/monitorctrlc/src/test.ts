import * as assert from "assert";
import * as chalk from "chalk";
import * as events from "events";
import * as tty from "tty";

import { monitorCtrlC } from "./index";

// We can't use mocha's "beforeEach" and "afterEach" because we're hijacking
// system behaviour and need to restore the original one as soon as possible
function hijackSystemCalls(cb: Function): () => any {
    return () => {
        const consoleBuffer: string[] = [];
        const emitter = new events.EventEmitter();
        const stdin = process.stdin as tty.ReadStream;

        const originalOn = stdin.on;
        stdin.on = emitter.on.bind(emitter);

        const originalEmit = process.stdin.emit;
        stdin.emit = emitter.emit.bind(emitter);

        const originalIsTTY = stdin.isTTY;
        stdin.isTTY = true;

        const originalSetRawMode = stdin.setRawMode;
        stdin.setRawMode = () => { consoleBuffer.push("setRawMode"); };

        const originalPause = stdin.pause;
        stdin.pause = () => { consoleBuffer.push("pause"); };

        const originalProcessExit = process.exit;
        process.exit = () => { consoleBuffer.push("exit"); };

        const originalProcessKill = process.kill;
        process.kill = function (): void { consoleBuffer.push(Array.prototype.slice.call(arguments, 0).join(" ")); };

        const originalConsoleLog = console.log;
        console.log = function (): void { consoleBuffer.push(chalk.stripColor(Array.prototype.slice.call(arguments, 0).join(" "))); };

        try {
            return cb(consoleBuffer);
        } finally {
            console.log = originalConsoleLog;
            process.exit = originalProcessExit;
            process.kill = originalProcessKill;
            stdin.setRawMode = originalSetRawMode;
            stdin.pause = originalPause;
            stdin.isTTY = originalIsTTY;
            stdin.emit = originalEmit;
            stdin.on = originalOn;
        }
    };
}


describe("monitorCtrlC()", () => {

    it("uses default handler", hijackSystemCalls((consoleBuffer: string[]) => {
        const monitor = monitorCtrlC();
        process.stdin.emit("data", new Buffer("\u0003")); // fake ^C

        assert.deepEqual(consoleBuffer, [
            "setRawMode",
            "'^C', exiting",
            "exit"
        ]);
        monitor.dispose();
    }));

    it("uses specified handler", hijackSystemCalls((consoleBuffer: string[]) => {
        const monitor = monitorCtrlC(() => { consoleBuffer.push("custom"); });
        process.stdin.emit("data", new Buffer("\u0003")); // fake ^C

        assert.deepEqual(consoleBuffer, [
            "setRawMode",
            "custom"
        ]);
        monitor.dispose();
    }));

    it("pauses STDIN after 'dispose' is invoked", hijackSystemCalls((consoleBuffer: string[]) => {
        const monitor = monitorCtrlC();

        monitor.dispose();

        assert.deepEqual(consoleBuffer, [
            "setRawMode",
            "setRawMode",
            "pause"
        ]);
    }));

});
