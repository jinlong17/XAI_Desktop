export interface PrivateChannelConfig {
  topic: string;
  private: true;
  accountId: string;
}

export function accountRealtimeTopic(accountId: string): string {
  return `private:account:${accountId}`;
}

export function createPrivateChannelConfig(accountId: string): PrivateChannelConfig {
  return {
    topic: accountRealtimeTopic(accountId),
    private: true,
    accountId,
  };
}

export class MockRealtimeBus {
  private readonly subscribers = new Map<string, Array<(event: unknown) => void>>();

  subscribe(config: PrivateChannelConfig, handler: (event: unknown) => void): () => void {
    const list = this.subscribers.get(config.topic) ?? [];
    list.push(handler);
    this.subscribers.set(config.topic, list);
    return () => {
      this.subscribers.set(
        config.topic,
        (this.subscribers.get(config.topic) ?? []).filter((candidate) => candidate !== handler),
      );
    };
  }

  publish(config: PrivateChannelConfig, event: { accountId: string; payload: unknown }): void {
    if (event.accountId !== config.accountId) {
      throw new Error('E3030: realtime private channel account mismatch');
    }
    for (const handler of this.subscribers.get(config.topic) ?? []) {
      handler(event.payload);
    }
  }
}
