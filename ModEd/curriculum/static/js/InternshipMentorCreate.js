class InternshipMentorCreate {
    constructor(application) {
        this.application = application;
    }

    async render() {
        console.log("Create Internship Mentor Form");
        console.log(this.application);

        if (!document.querySelector('script[src*="tailwindcss"]') && !document.querySelector('link[href*="tailwind"]')) {
            const script = document.createElement('script');
            script.src = "https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4";
            document.head.appendChild(script);
        }

   this.application.mainContainer.innerHTML = `
       <div class="bg-gray-100 min-h-screen py-8">
      <h1 class="text-2xl font-bold text-center text-gray-700 mb-8">
          Create Internship Mentor
      </h1>

      <form method="POST" 
       action="/curriculum/CreateInternshipMentor"
       class="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow-lg space-y-6">

          <!-- First Name -->
          <div>
       <label for="MentorFirstName" class="block mb-2 font-semibold text-gray-600">First Name</label>
       <input type="text" id="MentorFirstName" name="MentorFirstName"
         class="w-full px-3 py-2 border border-gray-300 rounded-md 
           focus:ring-2 focus:ring-blue-500 focus:outline-none" required>
          </div>

          <!-- Last Name -->
          <div>
       <label for="MentorLastName" class="block mb-2 font-semibold text-gray-600">Last Name</label>
       <input type="text" id="MentorLastName" name="MentorLastName"
         class="w-full px-3 py-2 border border-gray-300 rounded-md 
           focus:ring-2 focus:ring-blue-500 focus:outline-none" required>
          </div>

          <!-- Email -->
          <div>
       <label for="MentorEmail" class="block mb-2 font-semibold text-gray-600">Email</label>
       <input type="email" id="MentorEmail" name="MentorEmail"
         class="w-full px-3 py-2 border border-gray-300 rounded-md 
           focus:ring-2 focus:ring-blue-500 focus:outline-none" required>
          </div>

          <!-- Phone -->
          <div>
       <label for="MentorPhone" class="block mb-2 font-semibold text-gray-600">Phone</label>
       <input type="text" id="MentorPhone" name="MentorPhone"
         class="w-full px-3 py-2 border border-gray-300 rounded-md 
           focus:ring-2 focus:ring-blue-500 focus:outline-none" required>
          </div>

          <!-- Company ID -->
          <div>
       <label for="CompanyId" class="block mb-2 font-semibold text-gray-600">Company ID</label>
       <input type="number" id="CompanyId" name="CompanyId"
         class="w-full px-3 py-2 border border-gray-300 rounded-md 
           focus:ring-2 focus:ring-blue-500 focus:outline-none" required>
          </div>

          <!-- Button -->
          <button type="submit"
        class="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg 
          shadow-md hover:bg-blue-700 transition duration-200">
       Create Mentor
          </button>
      </form>
       </div>
   `;
    }
}
