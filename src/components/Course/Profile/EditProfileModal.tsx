import React, { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import styles from './EditProfileModal.module.css';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentName: string;
    currentImage: string;
    onSave: (newName: string, newImageUrl: string) => void;
}

const EditProfileModal = ({ isOpen, onClose, currentName, currentImage, onSave }: EditProfileModalProps) => {
    const [name, setName] = useState(currentName);
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState(currentImage);
    const [isChanged, setIsChanged] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setName(currentName);
        setImagePreview(currentImage);
    }, [currentName, currentImage]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
            setIsChanged(true);
        }
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
        setIsChanged(e.target.value !== currentName);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            let newImageUrl = currentImage;

            if (image) {
                const fileExt = image.name.split('.').pop();
                const fileName = `${Date.now()}.${fileExt}`;
                const filePath = `profile_images/${fileName}`;

                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('slide_img')
                    .upload(filePath, image, {
                        contentType: 'image/jpeg',
                        upsert: true
                    });

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('slide_img')
                    .getPublicUrl(filePath);

                newImageUrl = publicUrl;
            }

            await onSave(name, newImageUrl);
            onClose();
        } catch (error) {
            console.error('Error saving profile:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return null;
        setName(currentName);
        setImagePreview(currentImage);
    }

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2>Edit Profile</h2>
                <div className={styles.formGroup}>
                    <label>Profile Image</label>
                    <div className={styles.imagePreview}>
                        <img src={imagePreview} alt="Profile preview" />
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>Full Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={handleNameChange}
                        placeholder={currentName}
                    />
                </div>
                <div className={styles.buttonGroup}>
                    <button
                        className={styles.saveButton}
                        onClick={handleSave}
                        disabled={!isChanged || loading}
                    >
                        {loading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                        className={styles.cancelButton}
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditProfileModal; 