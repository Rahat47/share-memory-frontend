import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { client } from '../services/client';
import { MasonryLayout, Spinner } from '.';
import { feedQuery, searchQuery } from '../utils/data';

const Feed = () => {
    const [loading, setLoading] = useState(false);
    const [pins, setPins] = useState(null);
    const { categoryId } = useParams();

    useEffect(() => {
        setLoading(true);
        if (categoryId) {
            const query = searchQuery(categoryId);

            client
                .fetch(query)
                .then(data => {
                    setPins(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.log(err);
                    setLoading(false);
                });
        } else {
            client
                .fetch(feedQuery)
                .then(data => {
                    setPins(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.log(err);
                    setLoading(false);
                });
        }
    }, [categoryId]);

    if (loading)
        return <Spinner message='We are adding new ideas to your feed.' />;

    return (
        <div>
            {pins && pins.length ? (
                <MasonryLayout pins={pins} />
            ) : (
                <div className='flex justify-center items-center h-screen'>
                    <h1 className='text-3xl text-gray-500'>No pins found.</h1>
                </div>
            )}
        </div>
    );
};

export default Feed;
