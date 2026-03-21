// import express from 'express';
// import { addProperty, getNearbyProperties,deleteProperty, updateProperty, visitProperty,markPropertyAsSold,getSoldProperties,deleteSoldProperty, getMySoldProperties } from '../controllers/addController.js';
// import  upload  from '../middlewares/addUploads.js';
// import { verifyToken } from '../middlewares/authMiddleware.js';

// const router = express.Router();

// //  Add new property
// router.post('/add', upload.array("photosAndVideo", 10),verifyToken ,addProperty);

// //  Mark property as sold
// router.patch("/:id/mark-sold", verifyToken, markPropertyAsSold);


// //  Get all sold properties
// router.get("/sold", getSoldProperties);

// //  Delete sold property
// router.delete("/sold/:id", verifyToken, deleteSoldProperty);
// //  Get my sold properties
// router.get("/my-sold", verifyToken, getMySoldProperties);

// //  Visit property
// router.post("/:propertyId/visit", verifyToken, visitProperty);

// //  Get nearby properties

// router.get('/nearby', verifyToken, getNearbyProperties);

// // DELETE route by property ID
// router.delete('/delete/:id', deleteProperty);

// // UPDATE route by property ID
// router.put('/edit/:id', upload.array("photosAndVideo", 10), verifyToken , updateProperty);
// export default router;

import express from 'express';
import { addProperty, getNearbyProperties, deleteProperty, updateProperty, visitProperty, markPropertyAsSold, getSoldProperties, deleteSoldProperty, getMySoldProperties, addRecentUpdate, updateRecentUpdate, deleteRecentUpdate } from '../controllers/addController.js';
import upload from '../middlewares/addUploads.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { verifyAdminToken } from '../middlewares/adminAuthMiddleware.js';
import { verifyEmployeeToken } from '../middlewares/roleMiddleware.js';
import { checkRegistration } from '../middlewares/checkRegistrationMiddleware.js';

const router = express.Router();

//  Add new property (User) - Requires complete registration
router.post('/add', upload.any(), verifyToken, checkRegistration, addProperty);

// Add property (Employee with permissions)
router.post('/employee/add', upload.any(), verifyEmployeeToken, addProperty);

// Add property (Admin)
router.post('/admin/add', upload.any(), verifyAdminToken, addProperty);

//  Mark property as sold
router.patch("/:id/mark-sold", verifyToken, markPropertyAsSold);


//  Get all sold properties
router.get("/sold", getSoldProperties);

//  Delete sold property
router.delete("/sold/:id", verifyToken, deleteSoldProperty);
//  Get my sold properties
router.get("/my-sold", verifyToken, getMySoldProperties);

//  Visit property
router.post("/:propertyId/visit", verifyToken, visitProperty);

//  Get nearby properties

router.get('/nearby', verifyToken, getNearbyProperties);

// DELETE route by property ID
router.delete('/delete/:id', deleteProperty);

// UPDATE route by property ID
router.put('/edit/:id', upload.any(), verifyToken, updateProperty);

// Recent Updates Management
router.post('/:id/recent-updates', verifyToken, addRecentUpdate);
router.put('/:id/recent-updates/:updateId', verifyToken, updateRecentUpdate);
router.delete('/:id/recent-updates/:updateId', verifyToken, deleteRecentUpdate);

export default router;