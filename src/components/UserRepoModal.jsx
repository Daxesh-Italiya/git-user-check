import React, { useState } from 'react';
import { Modal, Table, Button, Space, Tag, Avatar, Typography, Popconfirm } from 'antd';
import { DeleteOutlined, ExclamationCircleOutlined, BankOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

const UserRepoModal = ({ visible, user, onClose, onRemoveFromRepo, onRemoveFromAll, loading }) => {
  const [removingRepoId, setRemovingRepoId] = useState(null);

  if (!user) return null;

  const { user: userData, repos } = user;

  const handleRemoveFromRepo = async (owner, repoName, username, repoId) => {
    setRemovingRepoId(repoId);
    try {
      await onRemoveFromRepo(owner, repoName, username);
    } finally {
      setRemovingRepoId(null);
    }
  };

  const columns = [
    {
      title: 'Repository',
      key: 'repo',
      render: (_, record) => (
        <div>
          <a href={record.repo.html_url} target="_blank" rel="noopener noreferrer">
            <Text strong>{record.repo.name}</Text>
          </a>
          <div className="tw-text-xs tw-text-gray-500">{record.repo.full_name}</div>
        </div>
      ),
    },
    {
      title: 'Organization',
      key: 'organization',
      render: (_, record) => (
        <Tag icon={<BankOutlined />} size="small">
          {record.repo.owner.login}
        </Tag>
      ),
    },
    {
      title: 'Permission',
      dataIndex: 'permission',
      key: 'permission',
      render: (permission) => (
        <Tag color={
          permission === 'admin' ? 'red' :
          permission === 'maintain' ? 'orange' :
          permission === 'push' ? 'blue' :
          'default'
        }>
          {permission}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        const isRemoving = removingRepoId === record.repo.id;
        return (
          <Popconfirm
            title="Remove collaborator"
            description={`Remove ${userData.login} from ${record.repo.name}?`}
            onConfirm={() => handleRemoveFromRepo(record.repo.owner.login, record.repo.name, userData.login, record.repo.id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true, loading: isRemoving }}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              loading={isRemoving}
            >
              Remove
            </Button>
          </Popconfirm>
        );
      },
    },
  ];

  return (
    <Modal
      title={
        <div className="tw-flex tw-items-center tw-gap-3">
          <Avatar src={userData.avatar_url} size="large" />
          <div>
            <Title level={4} className="tw-mb-0">{userData.login}</Title>
            <Text type="secondary">Member of {repos.length} repositories</Text>
          </div>
        </div>
      }
      open={visible}
      onCancel={onClose}
      width={800}
      footer={[
        <Popconfirm
          key="remove-all"
          title="Remove from all repositories"
          description={`Are you sure you want to remove ${userData.login} from all ${repos.length} repositories?`}
          onConfirm={() => onRemoveFromAll(userData.login)}
          okText="Yes, Remove All"
          cancelText="Cancel"
          okButtonProps={{ danger: true }}
          icon={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
        >
          <Button danger loading={loading}>
            Remove from All Repos
          </Button>
        </Popconfirm>,
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
    >
      <Table
        columns={columns}
        dataSource={repos}
        rowKey={(record) => record.repo.id}
        pagination={{
          pageSize: 5,
          showTotal: (total) => `${total} repositories`,
        }}
        size="small"
      />
    </Modal>
  );
};

export default UserRepoModal;
