// Session state contains intentions, not camera objects or React components.
export class VisitSession {
  constructor() {
    this.sequence = 1;
    this.pending = null;
    this.history = [];
  }
  issue(current, destination, action, remember = true) {
    if (remember && (current.scene !== destination.scene || current.point !== destination.point)) {
      const previous = this.history.at(-1);
      if (previous?.scene !== current.scene || previous?.point !== current.point) this.history.push({
        scene: current.scene,
        point: current.point
      });
    }
    const request = ++this.sequence;
    this.pending = action ? {
      request,
      action
    } : null;
    return {
      ...destination,
      request
    };
  }
  arrive(request) {
    if (this.pending?.request !== request) return null;
    const action = this.pending.action;
    this.pending = null;
    return action;
  }
  cancel() {
    this.pending = null;
  }
  back() {
    return this.history.pop();
  }
}
