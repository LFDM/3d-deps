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

  jumpToPast(steps: number) {
    if (steps === 0) {
      return this.history.present;
    }
    let nextEl: T | undefined;
    for (let i = 0; i < steps; i++) {
      if (!this.history.past.length) {
        return nextEl;
      }
      if (this.history.present !== undefined) {
        this.history.future.unshift(this.history.present);
      }
      nextEl = this.history.past.pop();
      this.history.present = nextEl;
    }
    return nextEl;
  }

  jumpToFuture(steps: number) {
    if (steps === 0) {
      return this.history.present;
    }
    let nextEl: T | undefined;
    for (let i = 0; i < steps; i++) {
      if (!this.history.future.length) {
        return nextEl;
      }
      if (this.history.present !== undefined) {
        this.history.past.push(this.history.present);
      }
      nextEl = this.history.future.shift();
      this.history.present = nextEl;
    }
    return nextEl;
  }

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
