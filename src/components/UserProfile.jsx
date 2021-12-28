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

const activeBtnStyles =
    'bg-red-500 text-white font-bold p-2 rounded-full w-20 outline-none';
const notActiveBtnStyles =
    'bg-primary mr-4 text-black font-bold p-2 rounded-full w-20 outline-none';

const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [pins, setPins] = useState(null);
    const [text, setText] = useState('Created');
    const [activeBtn, setActiveBtn] = useState('Created');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { userId } = useParams();

    useEffect(() => {
        const query = userQuery(userId);

        client.fetch(query).then(data => {
            setUser(data[0]);
        });
    }, [userId]);

    useEffect(() => {
        if (text === 'Created') {
            setLoading(true);
            const query = userCreatedPinsQuery(userId);

            client.fetch(query).then(data => {
                setPins(data);
                setLoading(false);
            });
        } else {
            setLoading(true);
            const query = userSavedPinsQuery(userId);

            client.fetch(query).then(data => {
                setPins(data);
                setLoading(false);
            });
        }
    }, [text, userId]);

    const logout = () => {
        localStorage.clear();
        navigate('/login');
    };

    if (!user) {
        return <Spinner message='Loading Profile...' />;
    }

    return (
        <div className='relative pb-2 justify-center items-center flex'>
            <div className='flex flex-col pb-5 w-full'>
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
                        <h1 className='font-bold text-3xl text-center mt-3 capitalize underline underline-offset-2 decoration-blue-700'>
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

                    <div className='text-center my-7 border-b-2 border-gray-700 pb-2 border-dotted'>
                        <button
                            type='button'
                            onClick={e => {
                                setText(e.target.textContent);
                                setActiveBtn(e.target.textContent);
                            }}
                            className={`${
                                activeBtn === 'Created'
                                    ? activeBtnStyles
                                    : notActiveBtnStyles
                            }`}
                        >
                            Created
                        </button>

                        <button
                            type='button'
                            onClick={e => {
                                setText(e.target.textContent);
                                setActiveBtn(e.target.textContent);
                            }}
                            className={`${
                                activeBtn === 'Saved'
                                    ? activeBtnStyles
                                    : notActiveBtnStyles
                            }`}
                        >
                            Saved
                        </button>
                    </div>

                    {pins?.length ? (
                        <div className='px-2'>
                            {loading ? (
                                <Spinner
                                    message={
                                        text === 'Created'
                                            ? 'Loading your created pins'
                                            : 'Loading your saved pins'
                                    }
                                />
                            ) : (
                                <MasonryLayout pins={pins} />
                            )}
                        </div>
                    ) : (
                        <div className='text-center'>
                            {loading ? (
                                <Spinner
                                    message={
                                        text === 'Created'
                                            ? 'Loading your created pins'
                                            : 'Loading your saved pins'
                                    }
                                />
                            ) : (
                                <h1 className='text-3xl font-bold italic text-stone-600'>
                                    {text === 'Created'
                                        ? 'You have not created any pins yet'
                                        : 'You have not saved any pins yet'}
                                </h1>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
