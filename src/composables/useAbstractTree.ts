interface ITreeeNode<T> {
  data: T;
  children: Tree<T>[];
}
interface ITree<T> {
  readonly root: ITreeeNode<T> | undefined;
  insert: (data: T) => ITree<T>;
}
export class Tree<T> implements ITree<T> {
  public root: ITreeeNode<T> | undefined = undefined;

  public insert(data: T): ITree<T> {
    if (!typeof this.root === undefined) {
      const _root = {
        data: data,
        children: [],
      } satisfies ITreeeNode<T>;
      this.root = _root satisfies ITreeeNode<T>;
    }
    const _child = new Tree<T>();

    this.root?.children.push(_child.insert(data));
    return _child;
  }
}
