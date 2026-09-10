import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Camera,
  CheckCircle,
  ImagePlus,
  LoaderCircle,
  Upload,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { listingAPI } from "../api";

const apiOrigin = (
  import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"
).replace(/\/api\/v1$/, "");

const SellAnimal = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [stream, setStream] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [busy, setBusy] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    title: "",
    animalType: "cattle",
    breed: "",
    sex: "female",
    ageYears: "",
    ageMonths: "",
    price: "",
    location: "",
    description: "",
  });

  useEffect(
    () => () => stream?.getTracks().forEach((track) => track.stop()),
    [stream],
  );

  const selectImage = (file) => {
    if (!file?.type.startsWith("image/")) {
      setMessage("Please choose a valid image file.");
      return;
    }
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setPrediction(null);
    setMessage("");
  };

  const startCamera = async () => {
    try {
      const nextStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      videoRef.current.srcObject = nextStream;
      setStream(nextStream);
      setCameraOpen(true);
      setMessage("");
    } catch {
      setMessage(
        "Camera access was unavailable. You can upload an image instead.",
      );
    }
  };

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) =>
        selectImage(
          new File([blob], `cattle-${Date.now()}.jpg`, { type: "image/jpeg" }),
        ),
      "image/jpeg",
      0.9,
    );
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
    setCameraOpen(false);
  };

  const identifyBreed = async () => {
    if (!imageFile)
      return setMessage("Add a photo before identifying the breed.");
    setBusy(true);
    setMessage("");
    try {
      const data = new FormData();
      data.append("image", imageFile);
      const response = await fetch(`${apiOrigin}/api/breed/predict`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: data,
      });
      const result = await response.json();
      if (!response.ok || !result.success)
        throw new Error(result.error || "Breed identification failed");
      setPrediction(result.data);
      setForm((current) => ({
        ...current,
        breed: result.data.breed,
        title: `${result.data.breed} ${current.animalType}`,
      }));
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  };

  const updateForm = (event) =>
    setForm({ ...form, [event.target.name]: event.target.value });

  const publishListing = async (event) => {
    event.preventDefault();
    if (!prediction)
      return setMessage("Identify the breed before publishing your listing.");
    setBusy(true);
    setMessage("");
    try {
      await listingAPI.create({
        title: form.title,
        animalType: form.animalType,
        breed: form.breed,
        sex: form.sex,
        age: {
          years: Number(form.ageYears) || 0,
          months: Number(form.ageMonths) || 0,
        },
        price: Number(form.price),
        location: form.location,
        description: form.description,
        animalRecord: prediction.record?._id,
        images: [{ imageUrl: prediction.record?.images?.[0]?.imageUrl }],
      });
      navigate("/my-listings");
    } catch (error) {
      setMessage(error?.message || "Could not publish listing.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] px-6 py-8 md:px-10">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#374151]"
        >
          <ArrowLeft size={16} /> Home
        </Link>
        <div className="mt-8 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6B8E23]">
            Sell an animal
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#173B2D]">
            Create a cattle or buffalo listing
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[#66756D]">
            Add a clear photo, let Breedify identify the breed, then publish the
            details buyers need.
          </p>
        </div>

        {message && (
          <div className="mt-6 border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-sm text-[#991B1B]">
            {message}
          </div>
        )}

        <form
          onSubmit={publishListing}
          className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]"
        >
          <section className="bg-white p-6 ring-1 ring-[#E5E7EB]">
            <h2 className="text-lg font-semibold text-[#173B2D]">
              Animal photo
            </h2>
            <div className="mt-5 aspect-[4/3] overflow-hidden bg-[#173B2D]">
              {cameraOpen ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full object-cover"
                />
              ) : preview ? (
                <img
                  src={preview}
                  alt="Animal preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-white/60">
                  <ImagePlus size={36} />
                  <span className="mt-3 text-sm">
                    Upload or capture a photo
                  </span>
                </div>
              )}
            </div>
            <canvas ref={canvasRef} className="hidden" />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="flex cursor-pointer items-center justify-center gap-2 border border-[#D7DFD6] px-3 py-3 text-sm font-semibold text-[#173B2D] hover:bg-[#F7FAF4]">
                <Upload size={17} /> Upload
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => selectImage(event.target.files[0])}
                />
              </label>
              <button
                type="button"
                onClick={cameraOpen ? captureImage : startCamera}
                className="flex items-center justify-center gap-2 bg-[#173B2D] px-3 py-3 text-sm font-semibold text-white hover:bg-[#245642]"
              >
                <Camera size={17} /> {cameraOpen ? "Capture" : "Camera"}
              </button>
            </div>
            {preview && !prediction && (
              <button
                type="button"
                onClick={identifyBreed}
                disabled={busy}
                className="mt-3 flex w-full items-center justify-center gap-2 bg-[#D5F36B] px-4 py-3 text-sm font-semibold text-[#173B2D] disabled:opacity-60"
              >
                {busy ? (
                  <LoaderCircle className="animate-spin" size={17} />
                ) : (
                  <CheckCircle size={17} />
                )}{" "}
                Identify breed
              </button>
            )}
            {prediction && (
              <div className="mt-4 border border-[#D7DFD6] bg-[#F7FAF4] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6B8E23]">
                  AI result
                </p>
                <p className="mt-1 text-lg font-semibold text-[#173B2D]">
                  {prediction.breed}
                </p>
                <p className="text-sm text-[#66756D]">
                  Confidence: {prediction.confidence}%
                </p>
              </div>
            )}
          </section>

          <section className="bg-white p-6 ring-1 ring-[#E5E7EB]">
            <h2 className="text-lg font-semibold text-[#173B2D]">
              Listing details
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2 text-sm font-medium text-[#374151]">
                Listing title
                <input
                  required
                  name="title"
                  value={form.title}
                  onChange={updateForm}
                  placeholder="Healthy Murrah buffalo"
                  className="mt-2 w-full border border-[#D7DFD6] px-3 py-3 font-normal outline-none focus:border-[#6B8E23]"
                />
              </label>
              <label className="text-sm font-medium text-[#374151]">
                Animal type
                <select
                  name="animalType"
                  value={form.animalType}
                  onChange={updateForm}
                  className="mt-2 w-full border border-[#D7DFD6] px-3 py-3 font-normal"
                >
                  <option value="cattle">Cattle</option>
                  <option value="buffalo">Buffalo</option>
                </select>
              </label>
              <label className="text-sm font-medium text-[#374151]">
                Sex
                <select
                  name="sex"
                  value={form.sex}
                  onChange={updateForm}
                  className="mt-2 w-full border border-[#D7DFD6] px-3 py-3 font-normal"
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
              </label>
              <label className="text-sm font-medium text-[#374151]">
                Breed
                <input
                  required
                  name="breed"
                  value={form.breed}
                  onChange={updateForm}
                  placeholder="Identified breed"
                  className="mt-2 w-full border border-[#D7DFD6] px-3 py-3 font-normal"
                />
              </label>
              <label className="text-sm font-medium text-[#374151]">
                Price
                <input
                  required
                  min="0"
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={updateForm}
                  placeholder="Price"
                  className="mt-2 w-full border border-[#D7DFD6] px-3 py-3 font-normal"
                />
              </label>
              <label className="text-sm font-medium text-[#374151]">
                Age (years)
                <input
                  min="0"
                  type="number"
                  name="ageYears"
                  value={form.ageYears}
                  onChange={updateForm}
                  className="mt-2 w-full border border-[#D7DFD6] px-3 py-3 font-normal"
                />
              </label>
              <label className="sm:col-span-2 text-sm font-medium text-[#374151]">
                Location
                <input
                  required
                  name="location"
                  value={form.location}
                  onChange={updateForm}
                  placeholder="Village, district, state"
                  className="mt-2 w-full border border-[#D7DFD6] px-3 py-3 font-normal"
                />
              </label>
              <label className="sm:col-span-2 text-sm font-medium text-[#374151]">
                Description
                <textarea
                  name="description"
                  value={form.description}
                  onChange={updateForm}
                  rows="4"
                  placeholder="Health, milk yield, vaccination, and other useful details"
                  className="mt-2 w-full resize-none border border-[#D7DFD6] px-3 py-3 font-normal"
                />
              </label>
            </div>
            <button
              disabled={busy || !prediction}
              className="mt-6 flex w-full items-center justify-center gap-2 bg-[#173B2D] px-4 py-3 text-sm font-semibold text-white hover:bg-[#245642] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? (
                <LoaderCircle className="animate-spin" size={17} />
              ) : null}{" "}
              Publish listing
            </button>
          </section>
        </form>
      </div>
    </div>
  );
};

export default SellAnimal;
