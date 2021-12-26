import { useState, useEffect } from 'react';
import { AiOutlineLogout } from 'react-icons/ai';
import { useParams, useNavigate } from 'react-router-dom';
import { GoogleLogout } from 'react-google-login';

import {
    userCreatedPinsQuery,
    userQuery,
    userSavedPinsQuery,
} from '../utils/data';
import { client } from '../services/client';
import { MasonryLayout, Spinner } from '.';

const randomImg = () => {
    // return a random image from unsplash
    return `https://source.unsplash.com/random/1600x900/?nature,water,technology,photography`;
};

const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [pins, setPins] = useState(null);
    const [text, setText] = useState('Created');
    const [activeBtn, setActiveBtn] = useState('Created');
    const navigate = useNavigate();
    const { userId } = useParams();

    useEffect(() => {
        const query = userQuery(userId);

        client.fetch(query).then(data => {
            setUser(data[0]);
        });
    }, [userId]);

    const logout = () => {
        localStorage.clear();
        navigate('/login');
    };

    if (!user) {
        return <Spinner message='Loading Profile...' />;
    }

    return (
        <div className='relative pb-2 h-full justify-center items-center flex'>
            <div className='flex flex-col pb-5'>
                <div className='relative flex flex-col mb-7'>
                    <div className='flex flex-col justify-center items-center'>
                        <img
                            src={randomImg()}
                            alt='random banner'
                            className='w-full h-370 2xl:h-510 shadow-lg object-cover'
                        />
                        <img
                            src={user?.image}
                            alt={user.username}
                            className='rounded-full w-20 h-20 -mt-10 shadow-xl'
                        />
                        <h1 className='font-bold text-3xl text-center mt-3 capitalize'>
                            {user.username}
                        </h1>

                        <div className='absolute top-0 z-1 right-0 p-2'>
                            {userId === user._id && (
                                <GoogleLogout
                                    clientId={
                                        process.env.REACT_APP_GOOGLE_API_TOKEN
                                    }
                                    render={renderProps => (
                                        <button
                                            type='button'
                                            className='bg-white p-2 rounded-full cursor-pointer outline-none shadow-md'
                                            onClick={renderProps.onClick}
                                            disabled={renderProps.disabled}
                                        >
                                            <AiOutlineLogout
                                                color='red'
                                                fontSize={21}
                                            />
                                        </button>
                                    )}
                                    onLogoutSuccess={logout}
                                    cookiePolicy='single_host_origin'
                                />
                            )}
                        </div>
                    </div>

                    <div className='text-center mb-7'>
                        <button></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
