import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  let staffAccessToken = '';
  let staffRefreshToken = '';

  it('/v1/auth/staff/login (POST) - Valid login', () => {
    return request(app.getHttpServer())
      .post('/v1/auth/staff/login')
      .send({ email: 'admin@novamobile.test', password: 'Admin@12345' })
      .expect(201)
      .expect((res) => {
        expect(res.body.accessToken).toBeDefined();
        staffAccessToken = res.body.accessToken;
        
        // Find refresh_token cookie
        const cookies = res.headers['set-cookie'];
        expect(cookies).toBeDefined();
        const rtCookie = cookies.find((c: string) => c.startsWith('refresh_token='));
        expect(rtCookie).toBeDefined();
        staffRefreshToken = rtCookie.split(';')[0].split('=')[1];
      });
  });

  it('/v1/auth/me (GET) - Valid access token', () => {
    return request(app.getHttpServer())
      .get('/v1/auth/me')
      .set('Authorization', `Bearer ${staffAccessToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.email).toBe('admin@novamobile.test');
        expect(res.body.passwordHash).toBeUndefined();
      });
  });

  it('/v1/auth/refresh (POST) - Refresh tokens', () => {
    return request(app.getHttpServer())
      .post('/v1/auth/refresh')
      .set('Cookie', [`refresh_token=${staffRefreshToken}`])
      .expect(201)
      .expect((res) => {
        expect(res.body.accessToken).toBeDefined();
        // Check new refresh token
        const cookies = res.headers['set-cookie'];
        expect(cookies).toBeDefined();
      });
  });

  it('/v1/auth/refresh (POST) - Double use of refresh token fails', () => {
    // Reusing the old refresh token should fail with 401
    return request(app.getHttpServer())
      .post('/v1/auth/refresh')
      .set('Cookie', [`refresh_token=${staffRefreshToken}`])
      .expect(401);
  });
});
