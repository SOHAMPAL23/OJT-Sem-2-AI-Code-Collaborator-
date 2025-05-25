import React from 'react';

const Features = () => {
  return (
    <div id="features">
      <div className="features-headline">
        <h2 className="features-title">Features </h2>
        <h2 className="features-subtitle">We Provide</h2>
      </div>

      <div className="feature-box-container">
        <div className="feature-box1">
          <h3>Pair Programming</h3>
          <p>With integrated debugging tools, developers can collaborate to identify and fix issues in the codebase in real time. This feature allows teams to collaborate to debug together, share insights, and see the results of their changes instantly. Developers can also run tests, analyze outputs, and troubleshoot errors with ease, ensuring smoother development cycles. Additionally, pair programming, a practice where two developers work together on the same problem, is facilitated directly within the platform. One developer writes code while the other reviews it, making the process more efficient and reducing the chances of bugs.</p>
        </div>

        <div className="feature-box2">
          <h3>Real-Time Collaborative </h3>
          <p>This feature allows multiple developers to work on the same file or project simultaneously, with instant updates visible to all users. As each person types or modifies the code, everyone in the collaboration session sees the changes in real time. This eliminates the need for manually syncing changes, dramatically speeding up teamwork. Whether you're building a new feature or troubleshooting a bug, real-time collaborative editing ensures that all contributors are always working with the most current version of the code. It also eliminates the confusion and delays often caused by separate work sessions.</p>
        </div>

        <div className="feature-box1">
          <h3>File History & Code Export</h3>
          <p>The file tracking feature allows users to efficiently manage and download their project files in a compressed ZIP format, making it easier to share or back up their work. This feature enables developers to package their entire codebase, including all files, configurations, and assets, into a single ZIP file, which can be easily shared with teammates or transferred to other systems. By downloading the project as a ZIP, developers avoid the hassle of downloading files individually, saving time and ensuring that the entire project is bundled in one neatly compressed file.</p>
        </div>
      </div>
    </div>
  );
};

export default Features; 