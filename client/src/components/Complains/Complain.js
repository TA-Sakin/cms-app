import { Tooltip } from "@mui/material";
import axios from "axios";
import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { FaRegComment, FaUserCircle } from "react-icons/fa";
import { FiMoreHorizontal } from "react-icons/fi";
import { useAsyncError } from "react-router-dom";
import { toast } from "react-toastify";
import Comment from "./Comment";
import Votes from "./Votes";
import moment from "moment";

const Complain = ({ complain, userId }) => {
  const [name, setName] = useState("");
  const [totalComments, setTotalComments] = useState(0);
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState(0);
  const [deleted, setDeleted] = useState();
  const [showModal, setShowModal] = useState(false);
  const [showComment, setShowComment] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(
          `https://cms-server-production.up.railway.app/api/user/complain/uname?uid=${complain.citizen_id}&cid=${complain._id}`,
          {
            headers: {
              authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        setName(data[0]);
        setTotalComments(data[1]);
      } catch (error) {
        toast.error("Something went wrong", { theme: "colored" });
      }
    })();
  }, [complain.citizen_id, complain._id]);

  const deleteComplain = (id) => {
    (async () => {
      try {
        const { data } = axios.delete(
          `https://cms-server-production.up.railway.app/api/user/complain/${id}`,
          {
            headers: {
              authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        setDeleted(data);
        toast.warning("Complain deleted", { theme: "colored" });
        window.location.reload();
      } catch (error) {}
    })();
  };

  return (
    <div className="sm:max-w-lg max-w-sm mb-10 bg-white rounded-xl border-2 py-6 px-4 mx-6 sm:mx-10">
      <div className="flex justify-between">
        <div className="flex gap-2">
          <div>
            <FaUserCircle className="sm:text-4xl text-3xl text-gray-500" />
          </div>
          <div>
            <p className="text-sm">
              {complain.complainType !== "public-anonymous"
                ? name
                : "Anonymous"}
            </p>
            <p className="text-xs">
              <span> Posted: {moment(complain.submission_date).fromNow()}</span>{" "}
              | <span>Ward: {complain.ward}</span> |{" "}
              <span className="capitalize">Status: {complain.status}</span> |{" "}
              <span className="capitalize">Category: {complain.category}</span>{" "}
            </p>
          </div>
        </div>
        {complain.citizen_id === userId && (
          <div className={`${showModal && "relative"}`}>
            <div
              className="cursor-pointer"
              onClick={() => setShowModal(!showModal)}
            >
              <FiMoreHorizontal />
            </div>
            {showModal && (
              <div className="px-8 py-4 justify-center right-0 z-10 absolute bg-white shadow-lg rounded-lg items-center">
                <button
                  className="btn btn-sm"
                  onClick={() => deleteComplain(complain._id)}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="mt-6">
        <p className="text-sm mb-4">
          <span className="font-bold">Location:</span> {complain.address}
        </p>
        <p className="text-sm mb-5">{complain.description}</p>
        <div className="flex items-center gap-2">
          {complain.attachment.map((image, i) => (
            <div className="flex-1" key={i}>
              <img className="w-fit" src={image.url} alt="" />
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="flex items-center gap-1 mt-4">
          <Votes complain={complain} key={complain._id} />
          <Tooltip title="comment" placement="top" arrow>
            <div
              className="ml-5 text-2xl cursor-pointer hover:text-blue-500 flex gap-1 items-center"
              onClick={() => setShowComment(!showComment)}
            >
              <FaRegComment />
              <p className="text-sm">{totalComments}</p>
            </div>
          </Tooltip>
        </div>
        {showComment && (
          <Comment
            key={complain._id}
            complain={complain}
            setTotalComments={setTotalComments}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default Complain;
