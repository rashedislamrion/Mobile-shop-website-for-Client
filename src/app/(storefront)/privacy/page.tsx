export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 tracking-tight">Privacy Policy</h1>
      <div className="prose prose-slate max-w-none bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <p className="text-slate-600 leading-relaxed mb-6">
          Your privacy is important to us. It is NovaMobile&apos;s policy to respect your privacy regarding any information we may collect from you across our website. We ask for personal information only when we truly need it to provide a service to you.
        </p>
        
        <h3 className="text-xl font-bold text-slate-800 mt-8 mb-4">1. Information We Collect</h3>
        <p className="text-slate-600 leading-relaxed mb-6">
          We collect information from you when you register on our site, place an order, subscribe to our newsletter, respond to a survey or fill out a form. When ordering or registering on our site, as appropriate, you may be asked to enter your: name, e-mail address, mailing address, phone number or credit card information.
        </p>
        
        <h3 className="text-xl font-bold text-slate-800 mt-8 mb-4">2. How We Use Your Information</h3>
        <p className="text-slate-600 leading-relaxed mb-6">
          Any of the information we collect from you may be used in one of the following ways:
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>To personalize your experience (your information helps us to better respond to your individual needs)</li>
            <li>To improve our website (we continually strive to improve our website offerings based on the information and feedback we receive from you)</li>
            <li>To improve customer service (your information helps us to more effectively respond to your customer service requests and support needs)</li>
            <li>To process transactions</li>
          </ul>
        </p>
        
        <h3 className="text-xl font-bold text-slate-800 mt-8 mb-4">3. Data Protection</h3>
        <p className="text-slate-600 leading-relaxed mb-6">
          We implement a variety of security measures to maintain the safety of your personal information when you place an order or enter, submit, or access your personal information. We offer the use of a secure server. All supplied sensitive/credit information is transmitted via Secure Socket Layer (SSL) technology and then encrypted into our Payment gateway providers database only to be accessible by those authorized with special access rights to such systems.
        </p>
      </div>
    </div>
  );
}
