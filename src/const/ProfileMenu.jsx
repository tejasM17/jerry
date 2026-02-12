import { useState, useRef, useEffect } from "react";
import { signOut, updateProfile } from "firebase/auth";
import { auth } from "../firebase/firebase.config";
import { FiLogOut, FiSettings } from "react-icons/fi";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebase.config";
import { FaUserCircle } from "react-icons/fa";

const ProfileMenu = ({ user }) => {
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const menuRef = useRef();

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handlePhotoUpdate = async (file) => {
    if (!file || !auth.currentUser) {
      alert("Please select a file first.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "jerry_unsigned");

      const response = await fetch(
        "https://api.cloudinary.com/v1_1/djx1pesuh/image/upload",
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await response.json();

      if (!data.secure_url) {
        console.error(data);
        alert("Upload failed. Check preset.");
        return;
      }

      const imageUrl = data.secure_url;

      await updateProfile(auth.currentUser, {
        photoURL: imageUrl,
      });

      await setDoc(
        doc(db, "users", auth.currentUser.uid),
        {
          photoURL: imageUrl,
          updatedAt: new Date(),
        },
        { merge: true },
      );

      alert("Profile photo updated");
      setOpen(false);
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Profile Button */}
      <div
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[#303030] cursor-pointer"
      >
        {user?.photoURL ? (
          <img
            src={user.photoURL}
            alt="profile"
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <FaUserCircle className="w-8 h-8 text-gray-400" />
        )}

        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-200 truncate">
            {user?.displayName || "User"}
          </div>
          <div className="text-xs text-gray-500 truncate">{user?.email}</div>
        </div>
      </div>

      {/* Drop-up Menu */}
      {open && (
        <div className="absolute bottom-12 left-0 w-full bg-[#1a1a1a] border border-[#252525] rounded-xl p-3 space-y-3 shadow-lg">
          {/* Update Photo */}
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="w-full text-sm text-gray-300"
            />

            <button
              onClick={() => handlePhotoUpdate(selectedFile)}
              className="w-full mt-2 bg-[#303030] p-2 rounded text-sm hover:bg-[#3a3a3a]"
            >
              Update Photo
            </button>
          </div>

          <hr className="border-[#252525]" />

          {/* Settings */}
          <button className="flex items-center gap-2 w-full text-sm text-gray-300 hover:text-white">
            <FiSettings size={16} />
            Settings
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full text-sm text-red-400 hover:text-red-500"
          >
            <FiLogOut size={16} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
