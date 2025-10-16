import { useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useEffect, useContext } from "react";
import { ShopContext } from "../../Context/ShopContext";

const VerifyOrderSuccess = () => {
  const { auth, navigate } = useContext(ShopContext);
  const [searchParams] = useSearchParams();

  const status = searchParams.get("status");

  useEffect(() => {
    if (!auth.isLoggedIn || !status) return;

    if (status === "success") {
      toast.success("Thanh toán thành công!");
      navigate("/orders");
    } else {
      toast.error("Thanh toán thất bại!");
      navigate("/");
    }
  }, [auth.isLoggedIn, status]);

  return null;
};

export default VerifyOrderSuccess;
