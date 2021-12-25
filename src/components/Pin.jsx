import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { MdDownloadForOffline } from 'react-icons/md';
import { AiTwotoneDelete } from 'react-icons/ai';
import { BsFillArrowRightCircleFill } from 'react-icons/bs';
import { client, urlFor } from '../services/client';
import { fetchUser } from '../utils/fetchUser';

const Pin = ({ pin }) => {
    const navigate = useNavigate();
    const [postHover, setPostHover] = useState(false);
    const [savingPost, setSavingPost] = useState(false);
    const user = fetchUser();

    const alreadySaved =
        pin?.save?.filter(item => item.postedBy._id === user?.googleId).length >
        0;

    const savePin = async id => {
        if (!alreadySaved) {
            setSavingPost(true);

            client
                .patch(id)
                .setIfMissing({ save: [] })
                .insert('after', 'save[-1]', [
                    {
                        _id: uuidv4(),
                        userId: user?.googleId,
                        postedBy: {
                            _type: 'postedBy',
                            _ref: user.googleId,
                        },
                    },
                ])
                .commit()
                .then(() => {
                    window.location.reload();
                    setSavingPost(false);
                });
        }
    };

    const deletePin = async id => {
        client.delete(id).then(() => {
            window.location.reload();
        });
    };

    return (
        <div className='m-2'>
            <div
                onMouseEnter={() => setPostHover(true)}
                onMouseLeave={() => setPostHover(false)}
                onClick={() => navigate(`/pin-detail/${pin._id}`)}
                className='relative cursor-zoom-in w-auto hover:shadow-lg rounded-lg overflow-hidden transition-all duration-500 ease-in-out'
            >
                <img
                    src={urlFor(pin.image).width(250).url()}
                    alt={pin.title}
                    className='rounded-lg w-full'
                />
                {postHover && (
                    <div
                        style={{
                            height: '100%',
                        }}
                        className='absolute top-0 w-full h-full flex flex-col justify-between p-1 pr-2 pt-2 z-50'
                    >
                        <div className='flex items-center justify-between'>
                            <div className='flex gap-2'>
                                <a
                                    href={`${pin?.image?.asset?.url}?dl=`}
                                    download
                                    onClick={e => e.stopPropagation()}
                                    className='bg-white w-9 h-9 rounded-full flex items-center justify-center text-dark text-xl opacity-75 hover:opacity-100 hover:shadow-md outline-none'
                                >
                                    <MdDownloadForOffline />
                                </a>
                            </div>

                            {alreadySaved ? (
                                <button
                                    type='button'
                                    className='bg-red-500 opacity-70 hover:opacity-100 text-white font-bold px-5 py-1 text-base rounded-3xl hover:shadow-md outline-none'
                                >
                                    {pin?.save?.length} Saved
                                </button>
                            ) : (
                                <button
                                    type='button'
                                    className='bg-red-500 opacity-70 hover:opacity-100 text-white font-bold px-5 py-1 text-base rounded-3xl hover:shadow-md outline-none'
                                    onClick={e => {
                                        e.stopPropagation();
                                        savePin(pin._id);
                                    }}
                                >
                                    {savingPost ? 'Saving...' : 'Save'}
                                </button>
                            )}
                        </div>
                        <div className='flex justify-between items-center gap-2 w-full'>
                            {pin?.destination && (
                                <a
                                    href={pin.destination}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='bg-white flex items-center gap-2 text-black font-bold p-2 px-4 rounded-full opacity-70 hover:opacity-100
                                    hover:shadow-md outline-none truncate'
                                >
                                    <BsFillArrowRightCircleFill />{' '}
                                    {pin.destination.slice(8, 17)}
                                </a>
                            )}

                            {pin.postedBy?._id === user?.googleId && (
                                <button
                                    type='button'
                                    onClick={e => {
                                        e.stopPropagation();
                                        deletePin(pin._id);
                                    }}
                                    className='bg-white opacity-70 hover:opacity-100 font-bold flex items-center justify-center w-9 h-9 text-base rounded-full hover:shadow-md outline-none'
                                >
                                    <AiTwotoneDelete />
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <Link
                to={`/user-profile/${pin.postedBy?._id}`}
                className='flex gap-2 mt-2 items-center'
            >
                <img
                    src={pin.postedBy?.image}
                    alt={pin.postedBy?.username}
                    className='w-8 h-8 rounded-full object-cover'
                />
                <p className='font-semibold capitalize'>
                    {pin.postedBy?.username}
                </p>
            </Link>
        </div>
    );
};

export default Pin;
