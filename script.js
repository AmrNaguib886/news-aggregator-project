document.getElementById("menuButton").addEventListener("click", function() {
    document.getElementById("navDrawer").style.right = "0px";
});

document.getElementById("closeButton").addEventListener("click", function() {
    document.getElementById("navDrawer").style.right = "-100px";
});
// async function checkAdminStatus() {
//     try {
//       // Always include credentials so the session cookie is sent
//       const response = await fetch("http://localhost:3000/is-admin", { credentials: "include" });
//       const data = await response.json();
//       if (data.isAdmin) {
//         // If admin, show the news submission form and the logout button
//         document.getElementById("newsForm").style.display = "block";
//         document.getElementById("loginButton").style.display = "none";
//         document.getElementById("logoutButton").style.display = "block";
//         if (!newsForm || !loginButton || !logoutButton) {
//           console.error("One or more required elements (newsForm, loginButton, logoutButton) are missing.");
//         }
      

//       } else {
//         // If not admin, hide the form and show the login button
//         document.getElementById("newsForm").style.display = "none";
//        document.getElementById("loginButton").style.display = "block";
//         document.getElementById("logoutButton").style.display = "none";
//       }
//     } catch (error) {
//       console.error("Error checking admin status:", error);
//     }
//   }

// async function checkAdminStatus() {
//   try {
//       const response = await fetch("http://localhost:3000/is-admin", { credentials: "include" });
//       const data = await response.json();

//       // Retrieve DOM elements and check if they exist
//       const newsForm = document.getElementById("newsForm");
//       const loginButton = document.getElementById("loginButton");
//       const logoutButton = document.getElementById("logoutButton");

//       if (!newsForm || !loginButton || !logoutButton) {
//           console.error("One or more required elements (newsForm, loginButton, logoutButton) are missing.");
//           return;
//       }

//       // If isAdmin is true, show the form and logout button; else hide them
//       if (data.isAdmin) {
//           newsForm.style.display = "block";
//           loginButton.style.display = "none";
//           logoutButton.style.display = "block";
//       } else {
//           newsForm.style.display = "none";
//           loginButton.style.display = "block";
//           logoutButton.style.display = "none";
//       }
//   } catch (error) {
//       console.error("Error checking admin status:", error);
//   }
// }

  
//   // Run the check once the DOM is loaded
//   document.addEventListener("DOMContentLoaded", () => {
//     checkAdminStatus();
//     fetchNews(); // Load news after the admin check
//   });



async function checkAdminStatus() {
  try {
    const response = await fetch("http://127.0.0.1:3000/is-admin", { credentials: "include" });
    const data = await response.json();
    if (data.isAdmin) {
      document.getElementById("newsForm").style.display = "block";
      document.getElementById("loginButton").style.display = "none";
      document.getElementById("logoutButton").style.display = "block";
    } else {
      document.getElementById("newsForm").style.display = "none";
      document.getElementById("loginButton").style.display = "block";
      document.getElementById("logoutButton").style.display = "none";
    }
  } catch (error) {
    console.error("Error checking admin status:", error);
  }
}
document.addEventListener("DOMContentLoaded", () => {
  checkAdminStatus();
  fetchNews();
});

  