import React, { useState } from 'react';
import { Modal, Form, Input, Select, Button, message, Typography } from 'antd';

const { Option } = Select;
const { Text } = Typography;

const PERMISSIONS = [
  { value: 'pull', label: 'Pull (Read)', description: 'Can pull code' },
  { value: 'triage', label: 'Triage', description: 'Can manage issues and PRs' },
  { value: 'push', label: 'Push (Write)', description: 'Can push code' },
  { value: 'maintain', label: 'Maintain', description: 'Can push and manage settings' },
  { value: 'admin', label: 'Admin', description: 'Full access' },
];

const AddUserModal = ({ visible, repos, onClose, onAdd }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await onAdd(values.username, values.permission, values.repositories);
      message.success(`Successfully added ${values.username} to selected repositories`);
      form.resetFields();
      onClose();
    } catch (error) {
      message.error(error.message || 'Failed to add user');
    } finally {
      setLoading(false);
    }
  };

  const repoOptions = repos.map(repo => ({
    value: repo.full_name,
    label: `${repo.full_name} (${repo.private ? 'Private' : 'Public'})`,
  }));

  return (
    <Modal
      title="Add User to Repositories"
      open={visible}
      onCancel={onClose}
      width={600}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ permission: 'push' }}
      >
        <Form.Item
          label="Username"
          name="username"
          rules={[
            { required: true, message: 'Please enter a username' },
            { pattern: /^[a-zA-Z0-9-]+$/, message: 'Invalid username format' }
          ]}
        >
          <Input placeholder="e.g., octocat" />
        </Form.Item>

        <Form.Item
          label="Permission Level"
          name="permission"
          rules={[{ required: true }]}
        >
          <Select placeholder="Select permission level">
            {PERMISSIONS.map(perm => (
              <Option key={perm.value} value={perm.value}>
                <div>
                  <Text strong>{perm.label}</Text>
                  <div className="tw-text-xs tw-text-gray-500">{perm.description}</div>
                </div>
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Repositories"
          name="repositories"
          rules={[{ required: true, message: 'Please select at least one repository' }]}
        >
          <Select
            mode="multiple"
            placeholder="Select repositories"
            options={repoOptions}
            showSearch
            filterOption={(input, option) =>
              option.label.toLowerCase().includes(input.toLowerCase())
            }
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item className="tw-mb-0 tw-flex tw-justify-end tw-gap-2">
          <Button onClick={onClose}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Add User
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddUserModal;
