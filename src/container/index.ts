class Container {
  private containerMap = new Map<string | symbol, any>();

  public set(id: string | symbol, value: any): void {
    this.containerMap.set(id, value);
  }

  public get<T extends any>(id: string | symbol): T {
    return this.containerMap.get(id) as T;
  }

  public has(id: string | symbol): boolean {
    return this.containerMap.has(id);
  }
};

const containerInstance = new Container();

export default containerInstance;
