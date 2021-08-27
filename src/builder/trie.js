let TraverseStatus;

(function (TraverseStatus) {
  TraverseStatus[(TraverseStatus['TRAVERSING'] = 0)] = 'TRAVERSING';
  TraverseStatus[(TraverseStatus['EXTRANEOUS'] = 1)] = 'EXTRANEOUS';
  TraverseStatus[(TraverseStatus['MISMATCH'] = 2)] = 'MISMATCH';
  TraverseStatus[(TraverseStatus['PARTIAL_MATCH'] = 3)] = 'PARTIAL_MATCH';
  TraverseStatus[(TraverseStatus['FULL_MATCH'] = 4)] = 'FULL_MATCH';
})(TraverseStatus || (TraverseStatus = {}));

const matchBeginning = (left, right) => {
  let matchLength = 0;
  while (matchLength < left.length && matchLength < right.length) {
    if (left[matchLength] !== right[matchLength]) {
      return {
        matching: left.substring(0, matchLength),
        remainingLeft: left.substring(matchLength),
        remainingRight: right.substring(matchLength),
      };
    } else {
      matchLength++;
    }
  }
  return {
    matching: left.substring(0, matchLength),
    remainingLeft: left.substring(matchLength),
    remainingRight: right.substring(matchLength),
  };
};

const traverseNode = (node, key) => {
  const {
    matching: matchingKey,
    remainingLeft: remainingNodeKey,
    remainingRight: remainingKey,
  } = matchBeginning(node.key, key);
  if (remainingNodeKey.length === 0 && remainingKey.length === 0) {
    return {
      status: TraverseStatus.FULL_MATCH,
      matchingKey,
      remainingNodeKey,
      remainingKey,
      currentNode: node,
    };
  } else if (remainingKey.length === 0) {
    return {
      status: TraverseStatus.PARTIAL_MATCH,
      matchingKey,
      remainingNodeKey,
      remainingKey,
      currentNode: node,
    };
  } else if (remainingNodeKey.length === 0) {
    if (remainingKey[0] in node.next) {
      return {
        status: TraverseStatus.TRAVERSING,
        matchingKey,
        remainingNodeKey,
        remainingKey,
        currentNode: node.next[remainingKey[0]],
      };
    } else {
      return {
        status: TraverseStatus.EXTRANEOUS,
        matchingKey,
        remainingNodeKey,
        remainingKey,
        currentNode: node,
      };
    }
  } else {
    return {
      status: TraverseStatus.MISMATCH,
      matchingKey,
      remainingNodeKey,
      remainingKey,
      currentNode: node,
    };
  }
};

const populateTrailingValues = (values, node) => {
  if (node.value !== undefined) {
    values.push(node.value);
  }
  for (const nextNodeKey in node.next) {
    const nextNode = node.next[nextNodeKey];
    populateTrailingValues(values, nextNode);
  }
};

export class Trie {
  constructor() {
    this.rootNode = {
      key: '',
      next: {},
    };
  }
  traverse(key) {
    let currentNode = this.rootNode;
    let prefix = '';
    let traverseResult;
    do {
      traverseResult = traverseNode(currentNode, key);
      currentNode = traverseResult.currentNode;
      key = traverseResult.remainingKey;
      if (traverseResult.status === TraverseStatus.TRAVERSING) {
        prefix += traverseResult.matchingKey;
      }
    } while (traverseResult.status === TraverseStatus.TRAVERSING);
    return {
      ...traverseResult,
      keyPrefix: prefix,
    };
  }
  add(key, value) {
    const {
      status,
      matchingKey,
      remainingNodeKey,
      remainingKey,
      currentNode: lastNode,
    } = this.traverse(key.trim().toLowerCase());
    switch (status) {
      case TraverseStatus.FULL_MATCH:
        break;
      case TraverseStatus.PARTIAL_MATCH:
        lastNode.key = matchingKey;
        lastNode.next = {
          [remainingNodeKey[0]]: {
            key: remainingNodeKey,
            value: lastNode.value,
            next: lastNode.next,
          },
        };
        lastNode.value = value;
        break;
      case TraverseStatus.EXTRANEOUS:
        lastNode.next[remainingKey[0]] = {
          key: remainingKey,
          value: value,
          next: {},
        };
        break;
      case TraverseStatus.MISMATCH:
        lastNode.key = matchingKey;
        lastNode.next = {
          [remainingNodeKey[0]]: {
            key: remainingNodeKey,
            value: lastNode.value,
            next: lastNode.next,
          },
          [remainingKey[0]]: {
            key: remainingKey,
            value: value,
            next: {},
          },
        };
        delete lastNode.value;
        break;
      default:
      case TraverseStatus.TRAVERSING:
        throw new Error('Trie traversal state is invalid.');
    }
  }
  remove(key) {
    const { status, currentNode: lastNode } = this.traverse(key.trim().toLowerCase());
    if (status === TraverseStatus.FULL_MATCH) {
      delete lastNode.value;
    }
  }
  clear() {
    this.rootNode = {
      key: '',
      next: {},
    };
  }
  containsKey(key) {
    const { status, currentNode: lastNode } = this.traverse(key.trim().toLowerCase());
    return status === TraverseStatus.FULL_MATCH && lastNode.value !== undefined;
  }
  getValue(key) {
    const { status, currentNode: lastNode } = this.traverse(key.trim().toLowerCase());
    return status === TraverseStatus.FULL_MATCH ? lastNode.value : undefined;
  }
  containsKeyBeginningWith(prefix) {
    const { status } = this.traverse(prefix.trim().toLowerCase());
    return status === TraverseStatus.FULL_MATCH || status === TraverseStatus.PARTIAL_MATCH;
  }
  getValuesForKeysBeginningWith(prefix) {
    const values = [];
    const { status, currentNode: lastNode } = this.traverse(prefix.trim().toLowerCase());
    if (status === TraverseStatus.FULL_MATCH || status === TraverseStatus.PARTIAL_MATCH) {
      populateTrailingValues(values, lastNode);
    }
    return values;
  }
}
