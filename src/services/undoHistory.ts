export class UndoHistory<T> {
  private depth: number;
  private history: {
    past: T[];
    present: T | undefined;
    future: T[];
  } = { past: [], present: undefined, future: [] };
  constructor(depth: number = 10) {
    this.depth = depth;
  }

  getPresent() {
    return this.history.present;
  }

  jumpToPast(steps: number) {}

  jumpToFuture(steps: number) {}

  undo() {
    return this.jumpToPast(1);
  }

  redo() {
    return this.jumpToFuture(1);
  }

  push(el: T) {
    this.history.future = [];
    if (this.history.present !== undefined) {
      this.history.past.push(this.history.present);
    }
    this.history.present = el;
    if (this.history.past.length > this.depth) {
      this.history.past.shift();
    }
  }
}
