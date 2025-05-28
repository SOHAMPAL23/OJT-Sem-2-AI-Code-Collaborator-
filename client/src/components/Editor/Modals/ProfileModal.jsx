// import React, { useState, useEffect } from 'react';



//   return (
//     <div className="room-modal-overlay">
//       <div className="profile-modal-content">
//         <button className="modal-back-btn" onClick={onClose}>
//           <span className="back-icon">←</span>
//           Back
//         </button>
        
//         <div className="profile-form">
//           <h2>Your Profile</h2>
          
//           <div className="profile-input-group">
//             <label className="profile-input-label">UserId</label>
//             <div className="profile-input-wrapper">
//               <span className="profile-input-icon">🎲</span>
//               <input
//                 type="text"
//                 name="usergeneratedname"
//                 className="profile-input"
//                 value={}
//                 onChange={}
//                 placeholder="Enter your name"
//                 required
//               />
//             </div>
//           </div>

//           <div className="profile-input-group">
//             <label className="profile-input-label">Email</label>
//             <div className="profile-input-wrapper">
//               <span className="profile-input-icon">📧</span>
             
//             </div>
//           </div>

//           <div className="profile-input-group">
//             <label className="profile-input-label">About You</label>
//             <div className="profile-input-wrapper">
//               <span className="profile-input-icon">👨‍💻</span>
//               <select
//                 className="profile-select"
//                 value={profileData.description}
//                 onChange={(e) => setProfileData(prev => ({ ...prev, description: e.target.value }))}
//               >
//                 <option value="">Select your role</option>
//                 <option value="designer">Designer</option>
//                 <option value="frontend">Frontend Developer</option>
//                 <option value="backend">Backend Developer</option>
//                 <option value="fullstack">Full Stack Developer</option>
//                 <option value="devops">DevOps Engineer</option>
//                 <option value="mobile">Mobile Developer</option>
//                 <option value="other">Other</option>
//               </select>
//             </div>
//           </div>

//           <div className="profile-input-group">
//             <label className="profile-input-label">Company</label>
//             <div className="profile-input-wrapper">
//               <span className="profile-input-icon">🏢</span>
//               <input
//                 type="text"
//                 className="profile-input"
//                 placeholder="Where do you work?"
//                 value={profileData.company}
//                 onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
//               />
//             </div>
//           </div>

//           <div className="profile-input-group">
//             <label className="profile-input-label">Expertise Languages</label>
//             <div className="profile-input-wrapper">
//               <span className="profile-input-icon">👨‍💻</span>
//               <input
//                 type="text"
//                 className="profile-input"
//                 placeholder="e.g., JavaScript, Java, Python (comma separated)"
//                 value={profileData.languages.join(', ')}
//                 onChange={(e) => setProfileData(prev => ({ 
//                   ...prev, 
//                   languages: e.target.value.split(',').map(lang => lang.trim()).filter(Boolean)
//                 }))}
//               />
//             </div>
//           </div>

//           <div className="profile-button-group">
//             <button 
//               className="profile-submit-btn"
              
//             >
//               <span>Save Profile</span>
//             </button>
//             <button 
//               className="profile-cancel-btn"
//               onClick={onClose}
//             >
//               <span>Cancel</span>
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProfileModal; 