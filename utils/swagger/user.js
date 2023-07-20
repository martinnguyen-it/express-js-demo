/**
 * @openapi
 * /api/v1/users/signup:
 *  post:
 *     tags:
 *     - Users
 *     summary: Sign up
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *         schema:
 *            type: object
 *            required:
 *             - email
 *             - name
 *             - password
 *             - passwordConfirm
 *            properties:
 *              email:
 *                   type: string
 *                   example: 'you@gmail.com'
 *              name:
 *                   type: string
 *                   example: 'Nguyen Van A'
 *              password:
 *                   type: string
 *                   format: password
 *                   example: 'test1234'
 *              passwordConfirm:
 *                   type: string
 *                   format: password
 *                   example: 'test1234'
 *     responses:
 *       200:
 *         description: Success
 */

/**
 * @openapi
 * /api/v1/users/login:
 *  post:
 *     tags:
 *     - Users
 *     summary: Login
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *         schema:
 *            type: object
 *            required:
 *             - email
 *             - password
 *            properties:
 *              email:
 *                   type: string
 *                   example: 'you@gmail.com'
 *              password:
 *                   type: string
 *                   format: password
 *                   example: 'test1234'
 *     responses:
 *       200:
 *         description: Success
 */

/**
 * @openapi
 * /api/v1/users/forgot-password:
 *  post:
 *     tags:
 *     - Users
 *     summary: Forgot password
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *         schema:
 *            type: object
 *            required:
 *             - email
 *            properties:
 *              email:
 *                   type: string
 *                   example: 'you@gmail.com'
 *     responses:
 *       200:
 *         description: Success
 */

/**
 * @openapi
 * /api/v1/users/reset-password/{token}:
 *  patch:
 *     tags:
 *     - Users
 *     summary: Reset password when forgot
 *     parameters:
 *      - name: token
 *        in: path
 *        description: Token reset password
 *        required: true
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *         schema:
 *            type: object
 *            required:
 *             - password
 *             - passwordConfirm
 *            properties:
 *              password:
 *                   type: string
 *                   format: password
 *                   example: 'test1234'
 *              passwordConfirm:
 *                   type: string
 *                   format: password
 *                   example: 'test1234'
 *     responses:
 *       200:
 *         description: Success
 */

/**
 * @openapi
 * /api/v1/users/update-me:
 *  patch:
 *     tags:
 *     - Users
 *     summary: Update user information
 *     requestBody:
 *      content:
 *        application/json:
 *         schema:
 *            type: object
 *            properties:
 *              email:
 *                   type: string
 *                   example: 'you@gmail.com'
 *              name:
 *                   type: string
 *                   example: 'Nguyen Van A'
 *              photo:
 *                   type: file
 *     responses:
 *       200:
 *         description: Success
 */
