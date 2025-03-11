import React, { useState, useEffect, use } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import styles from './EditProfileModal.module.css';
import { useWallet } from '@solana/wallet-adapter-react';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentName: string;
    currentImage: string;
    walletAddress: string;
    onSave: (newName: string, newImageUrl: string) => void;
}

interface profiledata {
    users_id: string;
    image_profile: string;
    wallet_address: string;
    username: string
    full_name: string
    is_instructor: boolean;
    is_student: boolean;
  }

interface users_id {
    id: string;
}

const EditProfileModal = ({ isOpen, onClose, currentName, currentImage, walletAddress, onSave }: EditProfileModalProps) => {
    const [name, setName] = useState(currentName);
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState('');
    const [isChanged, setIsChanged] = useState(false);
    const [loading, setLoading] = useState(false);

    const { publicKey,connected, disconnect } = useWallet();
    const [profiledata, setProfiledata] = useState<profiledata | null>(null);
    const [profile_img, setProfileImg] = useState<string | null>(null);
    const [usersID, setUserID] = useState<users_id | null>(null);

    useEffect(() => {
        console.log(publicKey);
        
        const fetchUserProfile = async () => {
            try {
                const { data, error: fetchError } = await supabase
                .rpc('check_role_in_navebar', {
                p_public_key:publicKey
                })
                if (fetchError) {
                    throw fetchError;
                  }
                  if (data) {
                    setProfiledata(data);
                    setProfileImg(data.image_profile)
                    setImagePreview(data.image_profile);
                  } else {
                    console.log('condition false');
                    
                  }

                  const { data: users, error } = await supabase
                  .from('users')
                  .select('id')
                  .eq('wallet_address', publicKey);
                      if (users) {
                        //   console.log(users[0].id);
                          setUserID(users[0].id);
                      } else if (error) {
          
                      }
            } catch (error) {
                console.error('Error fetching profile:', error);
            }
        }

        fetchUserProfile();
        console.log(profiledata);
    }, [publicKey]);

    useEffect(() => {
        if (isOpen) {
            setName(currentName);
            setImage(null);
            setIsChanged(false);
        }        
    }, [isOpen, currentName, currentImage]);

    const handleImageClick = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e: Event) => {
            const target = e.target as HTMLInputElement;
            if (target.files && target.files[0]) {
                const file = target.files[0];
                setImage(file);
                setImagePreview(URL.createObjectURL(file));
                setIsChanged(true);
            }
        };
        input.click();
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
        setIsChanged(e.target.value !== currentName);
    };

    const handleCancel = () => {
        setName(currentName);
        setImagePreview(currentImage);
        setImage(null);
        setIsChanged(false);
        onClose();
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            let newImageUrl = currentImage;

            if (image) {
                const fileExt = image.name.split('.').pop();
                const fileName = `profile_${Date.now()}.${fileExt}`;
                const filePath = `profile_images/${fileName}`;

                //: 
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('document')
                    .upload(filePath, image, {
                        contentType: 'image/jpeg',
                        upsert: true
                    });

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('document')
                    .getPublicUrl(filePath);

                newImageUrl = publicUrl;

                //: อัพเดท image_profile ใน users table
                const { error: updateError } = await supabase
                    .from('users')
                    .update({ image_profile: newImageUrl })
                    .eq('wallet_address', publicKey);
                if (updateError) throw updateError;

                // if (profiledata !== null && profiledata.is_instructor) {
                //     const { error: is_instructorError } = await supabase
                //         .from('instructors_list')
                //         .update({ ins_name: name })
                //         .eq('ins_id', walletAddress);
                //     if (updateError) throw updateError;
                // } else if (profiledata !== null && profiledata.is_student) {
                //     const { error: is_studentError } = await supabase
                //         .from('students_list')
                //         .update({ std_name: name })
                //         .eq('std_id', usersID);
                //     if (updateError) throw updateError;
                // }
            }
            //: Set the image to the latest uploaded image
            setImagePreview(newImageUrl);

            await onSave(name, newImageUrl);
            handleCancel();
        } catch (error) {
            console.error('Error saving profile:', error);
        } finally {
            setLoading(false);
            window.location.reload()
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2>Edit Profile</h2>
                <div className={styles.formContainer}>
                    <div className={styles.imageContainer}>
                        <div 
                            className={styles.imagePreview}
                            onClick={handleImageClick}
                        >
                            <img src={imagePreview || '/default_profile.png'} alt="Profile preview" />
                            <div className={styles.imageOverlay}>
                                <span>Click to change image</span>
                            </div>
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <input
                            type="text"
                            value={name}
                            onChange={handleNameChange}
                            placeholder={currentName}
                            className={styles.nameInput}
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
                            onClick={handleCancel}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditProfileModal; 