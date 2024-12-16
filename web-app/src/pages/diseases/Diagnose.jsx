import React, { useCallback, useState } from "react";
import upload from "../../assets/icons/upload.svg";
import { useDropzone } from "react-dropzone";
import { PushSpinner, RotateSpinner } from "react-spinners-kit";
import GaugeChart from "react-gauge-chart";
import { FaExclamationCircle, FaClock, FaCheckCircle } from "react-icons/fa";

const Prediction = ({ disease, type, confidence }) => {
  const getTypeIcon = type => {
    switch (type) {
      case "advanced":
        return <FaExclamationCircle className="text-red-500" />;
      case "early":
        return <FaClock className="text-yellow-500" />;
      case "normal":
        return <FaCheckCircle className="text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-[#D9D9D9]/20 items-center py-2 flex flex-col rounded gap-1">
      <div className="text-lg font-semibold font-inter">{disease}</div>
      <div className="flex items-center">
        <span className="font-semibold">{getTypeIcon(type)}</span>{" "}
        {/* Display icon based on type */}
        <span className="ml-2 capitalize text-lg my-1">{type}</span>
      </div>
      <GaugeChart id="gauge-chart2" nrOfLevels={20} percent={confidence} textColor="black" />
    </div>
  );
};

const Diagnose = ({ disease, handleSubmission, isSubmitting, prediction }) => {
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback(async acceptedFiles => {
    setLoading(true);
    // Handle the uploaded files
    console.log(acceptedFiles[0]);
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];

      const fileType = file.type;

      // Check if the file is an image
      if (!fileType.startsWith("image/")) {
        setImage(null);
        setImageUrl(null);
        setLoading(false);
        return;
      } else {
      }

      try {
        setImage(file); // Set image as the uploaded image
        // Set image as a URL for the uploaded image
        const imageUrl = URL.createObjectURL(file);
        setImageUrl(imageUrl);
        handleSubmission(file); // Handle the submission of the uploaded image
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error("Error uploading featured image:", error);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1, // Allow only one file
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
    },
  });

  return (
    <div>
      <div className="font-kanit text-4xl font-semibold text-black/70">
        Diagnose{" "}
        {disease && (
          <span className="font-medium text-3xl font-ubunutu">
            {">"} {disease}
          </span>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mt-5">
        <div className="p-10 bg-white rounded">
          <div className="" {...getRootProps()}>
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop the files here...</p>
            ) : (
              <div className="border-2 h-[240px] cursor-pointer border-dashed rounded flex items-center justify-center flex-col px-10 text-center">
                <img className="size-20" src={upload} />
                <div className="text-lg mt-2">Click to upload or drag and drop</div>
                <div className="font-semibold text-sm mt-2 font-inter">PNG or JPEG</div>
              </div>
            )}
          </div>
        </div>

        <div className="p-10 bg-white rounded flex items-center justify-center">
          {
            // Show loading spinner if loading
            loading ? (
              <div className="flex items-center justify-center">
                <RotateSpinner size={80} color="#C9DDF6" />
              </div>
            ) : (
              <div className="flex items-center justify-center flex-col">
                <img
                  src={
                    imageUrl ??
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVNer1ZryNxWVXojlY9Hoyy1-4DVNAmn7lrg&s"
                  }
                  className="w-[250px] rounded"
                />
                <div className="mt-1">{image?.name}</div>
              </div>
            )
          }
        </div>
      </div>

      {prediction && (
        <div className="mt-10 bg-white flex flex-col justify-self-center p-5 rounded min-w-[500px] md:max-w-[580px]">
          <div className="text-center mb-4 font-inter text-2xl">Prediction</div>
          {isSubmitting ? (
            <div className="flex items-center flex-col justify-center my-8">
              <PushSpinner size={50} color="#C9DDF6" />
            </div>
          ) : (
            <div className="gap-4 flex flex-col px-5">
              <Prediction {...prediction} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Diagnose;
