export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-lg mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Opion CRM
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-8">
          Altaion Interactive tarafından geliştirilen profesyonel CRM çözümü
        </p>
        <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
          <a 
            href="/login"
            className="inline-flex w-full sm:w-auto items-center justify-center px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Giriş Yap
          </a>
        </div>
      </div>
    </div>
  )
}
