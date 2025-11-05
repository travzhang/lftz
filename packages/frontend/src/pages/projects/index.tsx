import { Button, Col, Empty, Input, Row, Space, Tree, message } from 'antd';
import type { DataNode } from 'antd/es/tree';
import React, { useEffect, useMemo, useState } from 'react';

type Doc = {
  id: string;
  title: string;
  content: string;
  isFolder: boolean;
  parentId?: string | null;
  updatedAt: string;
};

const backendUrl =
  (import.meta as any).env?.VITE_BACKEND_URL || 'http://localhost:8080';

async function gqlFetch<T>(query: string, variables?: any): Promise<T> {
  const resp = await fetch(`${backendUrl}/graphql`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ query, variables }),
  });
  if (!resp.ok) throw new Error('Network error');
  const json = await resp.json();
  if (json.errors)
    throw new Error(json.errors?.[0]?.message || 'GraphQL error');
  return json.data as T;
}

const Q_MY_DOCS = /* GraphQL */ `
  query MyDocs { myDocs { id title content isFolder parentId updatedAt } }
`;
const M_CREATE = /* GraphQL */ `
  mutation CreateDoc($input: CreateDocInput!) { createDoc(input: $input) { id title isFolder parentId content updatedAt } }
`;
const M_UPDATE = /* GraphQL */ `
  mutation UpdateDoc($input: UpdateDocInput!) { updateDoc(input: $input) { id title content isFolder parentId updatedAt } }
`;
const M_DELETE = /* GraphQL */ `
  mutation DeleteDoc($id: ID!) { deleteDoc(id: $id) { id } }
`;

function buildTree(docs: Doc[]): DataNode[] {
  const map = new Map<string, DataNode & { raw: Doc }>();
  const roots: Array<DataNode & { raw: Doc }> = [];
  for (const d of docs) {
    map.set(d.id, { key: d.id, title: d.title, children: [], raw: d });
  }
  for (const d of docs) {
    const node = map.get(d.id)!;
    if (d.parentId && map.get(d.parentId)) {
      (map.get(d.parentId)!.children as DataNode[]).push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

const Page: React.FC = () => {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  // isFolder 状态当前不需要，依据 current.isFolder 即可

  const treeData = useMemo(() => buildTree(docs), [docs]);
  const current = useMemo(
    () => docs.find((d) => d.id === selectedId) || null,
    [docs, selectedId],
  );

  useEffect(() => {
    (async () => {
      try {
        const data = await gqlFetch<{ myDocs: Doc[] }>(Q_MY_DOCS);
        setDocs(data.myDocs);
      } catch (e: any) {
        message.error(e.message || '加载失败');
      }
    })();
  }, []);

  useEffect(() => {
    if (current) {
      setTitle(current.title);
      setContent(current.content);
    } else {
      setTitle('');
      setContent('');
    }
  }, [current?.id]);

  const reload = async () => {
    const data = await gqlFetch<{ myDocs: Doc[] }>(Q_MY_DOCS);
    setDocs(data.myDocs);
  };

  const onCreate = async (folder: boolean) => {
    const name = folder ? '新建文件夹' : '未命名文档';
    const parentId =
      selectedId && current?.isFolder ? selectedId : current?.parentId || null;
    await gqlFetch(M_CREATE, {
      input: { title: name, isFolder: folder, parentId },
    });
    await reload();
  };

  const onDelete = async () => {
    if (!selectedId) return;
    await gqlFetch(M_DELETE, { id: selectedId });
    setSelectedId(null);
    await reload();
  };

  const onSave = async () => {
    if (!selectedId) return;
    await gqlFetch(M_UPDATE, { input: { id: selectedId, title, content } });
    await reload();
    message.success('已保存');
  };

  return (
    <Row gutter={12} style={{ height: 'calc(100vh - 64px)' }}>
      <Col
        span={6}
        style={{
          borderRight: '1px solid rgba(5,5,5,0.06)',
          height: '100%',
          padding: 12,
        }}
      >
        <Space style={{ marginBottom: 12 }}>
          <Button size='small' onClick={() => onCreate(true)}>
            新建文件夹
          </Button>
          <Button type='primary' size='small' onClick={() => onCreate(false)}>
            新建文档
          </Button>
          <Button danger size='small' disabled={!selectedId} onClick={onDelete}>
            删除
          </Button>
        </Space>
        <Tree
          treeData={treeData}
          defaultExpandAll
          onSelect={(keys) => setSelectedId(String(keys[0]))}
        />
      </Col>
      <Col span={18} style={{ padding: 12, height: '100%' }}>
        {current ? (
          <div
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          >
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='标题'
              style={{ marginBottom: 12 }}
            />
            <Input.TextArea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder='在此编写 Markdown 内容'
              autoSize={{ minRows: 18 }}
              style={{ flex: 1 }}
            />
            <div style={{ marginTop: 12 }}>
              <Button type='primary' onClick={onSave}>
                保存
              </Button>
            </div>
          </div>
        ) : (
          <Empty description='请选择或新建文档' />
        )}
      </Col>
    </Row>
  );
};

export default Page;
