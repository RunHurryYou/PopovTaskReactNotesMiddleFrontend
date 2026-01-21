import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Alert,
  Space,
  Divider,
  Layout,
  Row,
  Col,
  Avatar
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  LoginOutlined,
  UserAddOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { databaseService } from '../../../services/dataBaseService';
import type { IUser } from '../../../services/types';
import { useAuthContext } from '../../../contexts/AuthProvider/hooks/useAuthContext';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { Content } = Layout;

const AuthComponent: React.FC = () => {
  const navigate = useNavigate();
  const auth = useAuthContext();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<IUser | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleRegister = async () => {
    try {
      setLoading(true);
      setError('');
      
      const existingUser = await databaseService.getUserByLogin(login);
      if (existingUser) {
        setError('Пользователь с таким логином уже существует');
        return;
      }

      const userId = await databaseService.createUser({
        login,
        password
      });
      
      const newUser = await databaseService.getUser(userId);
      setUser(newUser);
      setError('');
      auth?.signin(login, () => navigate('/'));
      form.resetFields();
    } catch (err) {
      setError('Ошибка при регистрации');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      
      const authenticatedUser = await databaseService.authenticateUser(login, password);
      if (authenticatedUser) {
        setUser(authenticatedUser);
        setError('');
        form.resetFields();
        auth?.signin(login, () => navigate('/'));
      } else {
        setError('Неверный логин или пароль');
      }
    } catch (err) {
      setError('Ошибка при входе');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (values: { login: string; password: string }) => {
    setLogin(values.login);
    setPassword(values.password);
    handleLogin();
  };

  const handleLogout = () => {
    setUser(null);
    setError('');
    form.resetFields();
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ padding: '50px 0' }}>
        <Row justify="center" align="middle">
          <Col xs={22} sm={18} md={12} lg={8} xl={6}>
            {!user ? (
              <Card
                title={
                  <Space direction="vertical" align="center" style={{ width: '100%' }}>
                    <Avatar
                      size={64}
                      icon={<UserOutlined />}
                      style={{ backgroundColor: '#1890ff', marginBottom: 16 }}
                    />
                    <Title level={3} style={{ margin: 0 }}>
                      Вход / Регистрация
                    </Title>
                    <Text type="secondary">
                      Введите свои данные для продолжения
                    </Text>
                  </Space>
                }
                bordered={false}
                style={{
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  borderRadius: 8
                }}
              >
                {error && (
                  <Alert
                    message={error}
                    type="error"
                    showIcon
                    closable
                    onClose={() => setError('')}
                    style={{ marginBottom: 24 }}
                  />
                )}

                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSubmit}
                  autoComplete="off"
                >
                  <Form.Item
                    name="login"
                    label="Логин"
                    rules={[
                      { required: true, message: 'Пожалуйста, введите логин!' },
                      { min: 3, message: 'Логин должен содержать минимум 3 символа' }
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="Введите ваш логин"
                      size="large"
                      onChange={(e) => setLogin(e.target.value)}
                    />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    label="Пароль"
                    rules={[
                      { required: true, message: 'Пожалуйста, введите пароль!' },
                      { min: 6, message: 'Пароль должен содержать минимум 6 символов' }
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="Введите ваш пароль"
                      size="large"
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<LoginOutlined />}
                      size="large"
                      block
                      loading={loading}
                      disabled={loading}
                    >
                      Войти
                    </Button>
                  </Form.Item>

                  <Divider plain>или</Divider>

                  <Form.Item>
                    <Button
                      type="default"
                      icon={<UserAddOutlined />}
                      size="large"
                      block
                      onClick={handleRegister}
                      loading={loading}
                      disabled={loading || !login || !password}
                    >
                      Зарегистрироваться
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            ) : (
              <Card
                style={{
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  borderRadius: 8,
                  textAlign: 'center'
                }}
              >
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <Avatar
                    size={80}
                    icon={<UserOutlined />}
                    style={{ backgroundColor: '#52c41a', margin: '0 auto' }}
                  />
                  
                  <Title level={2} style={{ margin: 0 }}>
                    Добро пожаловать!
                  </Title>
                  
                  <Text strong style={{ fontSize: '18px', color: '#1890ff' }}>
                    {user.login}
                  </Text>
                  
                  <Text type="secondary">
                    Вы успешно вошли в систему
                  </Text>
                  
                  <Divider />
                  
                  <Button
                    type="primary"
                    danger
                    icon={<LogoutOutlined />}
                    size="large"
                    onClick={handleLogout}
                    block
                  >
                    Выйти из аккаунта
                  </Button>
                </Space>
              </Card>
            )}
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default AuthComponent;