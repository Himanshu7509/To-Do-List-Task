import React from 'react'
import notfound from '../../assets/notfound.webp'

const NotFound = () => {
  return (
    <div className="w-full flex justify-center">
        <img src={notfound} className='w-1000'/>
    </div>
  )
}

export default NotFound