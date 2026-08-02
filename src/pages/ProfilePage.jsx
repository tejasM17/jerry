import { useState } from "react";
import { useNavigate } from "react-router-dom";
import EditProfileModal from "../features/profile/EditProfileModal";

/**
 * Legacy /profile route: open Edit profile modal (Phase 2), then return to chat on close.
 */
const ProfilePage = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  const handleClose = () => {
    setOpen(false);
    navigate("/", { replace: true });
  };

  return <EditProfileModal isOpen={open} onClose={handleClose} />;
};

export default ProfilePage;
