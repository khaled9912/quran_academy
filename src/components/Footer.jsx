import { FaFacebook, FaYoutube, FaHandPeace   } from 'react-icons/fa';

 const Footer = ()  => {
    return (
        <section className="w-full p-10 bg-gray-100 text-center md:text-left" id='contacts'>
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
                
                {/* Left Column - Message */}
                <div className="flex flex-col justify-center items-center md:items-start p-6 space-y-4">
                    <div className="flex items-center space-x-2">
                        <FaHandPeace className="text-3xl text-yellow-500" />
                        <h2 className="text-4xl font-semibold text-green-700">Reach Out</h2>
                    </div>
                    <p className="text-xl text-gray-700">Ready to start your Quran journey today? We are here to help you every step of the way.</p>
                    <div className="flex space-x-4 mt-6">
                        <a href="https://facebook.com/YourAcademy" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                            <FaFacebook className="text-3xl text-blue-600 hover:text-blue-800" />
                        </a>
                        <a href="https://youtube.com/YourAcademy" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                            <FaYoutube className="text-3xl text-red-600 hover:text-red-800" />
                        </a>
                    </div>
                </div>

                {/* Right Column - Contact Form */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <form className="flex flex-col space-y-4">
                        <input 
                            className="border border-gray-300 p-3 rounded-md w-full" 
                            type="text" 
                            placeholder="Your Name" 
                        />
                        <input 
                            className="border border-gray-300 p-3 rounded-md w-full" 
                            type="email" 
                            placeholder="Your Email" 
                        />
                        <textarea 
                            className="border border-gray-300 p-3 rounded-md w-full" 
                            rows="4" 
                            placeholder="Message"
                        ></textarea>
                        <button 
                            type="submit" 
                            className="w-full py-3 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600"
                        >
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
            <p className="mt-10 text-gray-500">&copy; {new Date().getFullYear()} AnaaQuran Academy. All rights reserved.</p>
        </section>
    );
}

export default Footer;