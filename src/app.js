const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const jwt = require('jsonwebtoken');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const userService = require('./services/userService');
require('dotenv').config();

const app = express();

const DOCS_COOKIE_NAME = 'api_docs_token';
const DOCS_COOKIE_MAX_AGE_SECONDS = 8 * 60 * 60;

const parseCookies = (cookieHeader = '') => {
  return cookieHeader.split(';').reduce((acc, pair) => {
    const [rawKey, ...rawValue] = pair.split('=');
    const key = (rawKey || '').trim();
    if (!key) {
      return acc;
    }
    acc[key] = decodeURIComponent(rawValue.join('=').trim());
    return acc;
  }, {});
};

const setDocsCookie = (res, token) => {
  const isSecure = process.env.NODE_ENV === 'production';
  const cookieParts = [
    `${DOCS_COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    `Max-Age=${DOCS_COOKIE_MAX_AGE_SECONDS}`,
    'HttpOnly',
    'SameSite=Lax'
  ];

  if (isSecure) {
    cookieParts.push('Secure');
  }

  res.setHeader('Set-Cookie', cookieParts.join('; '));
};

const clearDocsCookie = (res) => {
  const isSecure = process.env.NODE_ENV === 'production';
  const cookieParts = [
    `${DOCS_COOKIE_NAME}=`,
    'Path=/',
    'Max-Age=0',
    'HttpOnly',
    'SameSite=Lax'
  ];

  if (isSecure) {
    cookieParts.push('Secure');
  }

  res.setHeader('Set-Cookie', cookieParts.join('; '));
};

const requireApiDocsAdmin = (req, res, next) => {
  const cookies = parseCookies(req.headers.cookie || '');
  const token = cookies[DOCS_COOKIE_NAME];

  if (!token) {
    return res.redirect('/api-docs');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
    if (!decoded || decoded.role !== 'admin') {
      clearDocsCookie(res);
      return res.redirect('/api-docs');
    }

    req.user = decoded;
    return next();
  } catch (error) {
    clearDocsCookie(res);
    return res.redirect('/api-docs');
  }
};

const swaggerUiOptions = {
  customSiteTitle: 'Wedding API Docs',
  customJs: '/api-docs-assets/swagger-auto-auth.js',
  swaggerOptions: {
    persistAuthorization: true
  }
};

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/media', express.static(path.join(process.cwd(), 'media')));
app.use('/api-docs-assets', express.static(path.join(__dirname, 'public')));
app.use('/api-docs/ui', requireApiDocsAdmin, swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));
app.get('/api-docs', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'api-docs-login.html');
  return res.sendFile(filePath);
});
app.post('/api-docs/login', async (req, res) => {
  try {
    const data = await userService.login(req.body);
    if (!data.user || data.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ admin mới được truy cập API docs'
      });
    }

    setDocsCookie(res, data.token);
    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      redirect: '/api-docs/ui',
      token: data.token
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Đăng nhập thất bại'
    });
  }
});
app.post('/api-docs/logout', (req, res) => {
  clearDocsCookie(res);
  return res.status(200).json({
    success: true,
    message: 'Đăng xuất thành công'
  });
});

// Routes
const userRoutes = require('./routes/userRoutes');
const invitationRoutes = require('./routes/invitationRoutes');
const invitationTemplateRoutes = require('./routes/invitationTemplateRoutes');
const privateInvitationRoutes = require('./routes/privateInvitationRoutes');
const invitationImageRoutes = require('./routes/invitationImageRoutes');
const guestRoutes = require('./routes/guestRoutes');
const messageCheckinRoutes = require('./routes/messageCheckinRoutes');
const groomRoutes = require('./routes/groomRoutes');
const brideRoutes = require('./routes/brideRoutes');
const mediaUploadRoutes = require('./routes/mediaUploadRoutes');

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/user', userRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/invitation', invitationRoutes);
app.use('/api/invitation-templates', invitationTemplateRoutes);
app.use('/api/invitation_templates', invitationTemplateRoutes);
app.use('/api/private-invitations', privateInvitationRoutes);
app.use('/api/private_invitation', privateInvitationRoutes);
app.use('/api/invitation-images', invitationImageRoutes);
app.use('/api/invitation_images', invitationImageRoutes);
app.use('/api/guests', guestRoutes);
app.use('/api/guest', guestRoutes);
app.use('/api/messages-checkins', messageCheckinRoutes);
app.use('/api/messages_checkins', messageCheckinRoutes);
app.use('/api/grooms', groomRoutes);
app.use('/api/groom', groomRoutes);
app.use('/api/brides', brideRoutes);
app.use('/api/bride', brideRoutes);
app.use('/api/media-upload', mediaUploadRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Wedding Web API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/users',
      usersAlias: '/api/user',
      invitations: '/api/invitations',
      invitationsAlias: '/api/invitation',
      invitationTemplates: '/api/invitation-templates',
      invitationTemplatesAlias: '/api/invitation_templates',
      privateInvitations: '/api/private-invitations',
      privateInvitationsAlias: '/api/private_invitation',
      invitationImages: '/api/invitation-images',
      invitationImagesAlias: '/api/invitation_images',
      guests: '/api/guests',
      guestsAlias: '/api/guest',
      messagesCheckins: '/api/messages-checkins',
      messagesCheckinsAlias: '/api/messages_checkins',
      grooms: '/api/grooms',
      groomsAlias: '/api/groom',
      brides: '/api/brides',
      bridesAlias: '/api/bride',
      mediaUpload: '/api/media-upload',
      mediaUploadCrud: '/api/media-upload?resourceType=image|video',
      apiDocsLogin: '/api-docs',
      apiDocsUi: '/api-docs/ui'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route không tồn tại'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Multer error handling
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File quá lớn. Kích thước tối đa là 10MB'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Số lượng file vượt quá giới hạn'
      });
    }
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Lỗi server',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

module.exports = app;
