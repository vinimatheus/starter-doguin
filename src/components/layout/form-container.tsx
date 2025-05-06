import React from 'react'

interface FormContainerProps {
  children: React.ReactNode
}

const FormContainer: React.FC<FormContainerProps> = ({ children }) => {
  return (
    <div className="container relative min-h-screen flex flex-col items-center justify-center px-4 py-10 md:px-6">
      <div className="mx-auto w-full max-w-md space-y-6 rounded-xl border bg-card p-6 shadow-sm">
        {children}
      </div>
    </div>
  )
}

export default FormContainer 