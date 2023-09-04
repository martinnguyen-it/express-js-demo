/**
 * @openapi
 * /api/v1/tours/distance/{latlng}/unit/{unit}:
 *  get:
 *     tags:
 *     - Tours
 *     summary: Get all distance between user's coordinate provide and all tours
 *     parameters:
 *      - name: latlng
 *        in: path
 *        description: The coordinate point need find
 *        required: true
 *        example: 50,50
 *      - name: unitName
 *        in: path
 *        description: The unit of distance (mi or km)
 *        example: km
 *        required: true
 *     responses:
 *       200:
 *         description: Success
 */

/**
 * @openapi
 * /api/v1/tours/tours-within/{distance}/center/{latlng}/unit/{unitName}:
 *  get:
 *     tags:
 *     - Tours
 *     summary: Get tour within a distance
 *     parameters:
 *      - name: distance
 *        in: path
 *        description: The distance
 *        example: 1000
 *        required: true
 *      - name: unitName
 *        in: path
 *        description: The unit of distance (mi or km)
 *        example: km
 *        required: true
 *      - name: latlng
 *        in: path
 *        description: The coordinate point need find
 *        example: 50,50
 *        required: true
 *     responses:
 *       200:
 *         description: Success
 */
