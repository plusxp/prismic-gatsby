import * as gatsby from "gatsby";
import * as prismicT from "@prismicio/types";
import * as gatsbyPluginImage from "gatsby-plugin-image";
import * as gatsbyPluginImageGraphQLUtils from "gatsby-plugin-image/graphql-utils";
import fetch from "node-fetch";

type WeakImgixParams = Record<string, string | number | (string | number)[]>;

type ImgixGatsbyImageDataArgs = {
	placeholder?: "blurred" | "none";
	imgixParams?: WeakImgixParams;
	placeholderImgixParams?: WeakImgixParams;
};

const imgixGatsbyImageDataArgs = {
	placeholder: "ImgixLiteGatsbyImageDataPlaceholder",
	imgixParams: "ImgixLiteUrlParamsInput",
	placeholderImgixParams: "ImgixLiteUrlParamsInput",
};

const castArray = <T>(value: T): T[] => {
	return Array.isArray(value) ? value : [value];
};

const setURLParams = (
	url: string,
	params: Record<string, string | number | (string | number)[]>,
): string => {
	const instance = new URL(url);

	for (const key in params) {
		const value = castArray(params[key])
			.map((element) => element.toString())
			.join(",");

		instance.searchParams.set(key, value);
	}

	return instance.toString();
};

const fetchBase64Image = async (url: string): Promise<string> => {
	const res = await fetch(url);
	const buffer = await res.buffer();
	const contentType = res.headers.get("content-type");

	return `data:image/${contentType};base64,${buffer.toString("base64")}`;
};

const generateImageSource: gatsbyPluginImage.IGatsbyImageHelperArgs["generateImageSource"] =
	(
		filename,
		width,
		height,
		format,
		_fit,
		options?: ImgixGatsbyImageDataArgs,
	) => {
		const urlParams = (options && options.imgixParams) || {};
		const src = setURLParams(filename, urlParams);

		return {
			src,
			width,
			height,
			format,
		};
	};

const resolveGatsbyImageData = async (
	image: prismicT.ImageFieldImage,
	options: ImgixGatsbyImageDataArgs,
): Promise<gatsbyPluginImage.IGatsbyImageData | null> => {
	if (image.url == null || image.dimensions == null) {
		return null;
	}

	const filename = image.url;

	const imageDataArgs: gatsbyPluginImage.IGatsbyImageHelperArgs = {
		pluginName: "gatsby-source-prismic",
		sourceMetadata: {
			width: image.dimensions.width,
			height: image.dimensions.height,
			format: "",
		},
		filename,
		generateImageSource,
		options,
	};

	if (options.placeholder === "blurred") {
		const lowResolutionImageURL =
			gatsbyPluginImage.getLowResolutionImageURL(imageDataArgs);

		const finalLowResolutionImageURL = setURLParams(lowResolutionImageURL, {
			...options.imgixParams,
			...options.placeholderImgixParams,
		});

		imageDataArgs.placeholderURL = await fetchBase64Image(
			finalLowResolutionImageURL,
		);
	}

	return gatsbyPluginImage.generateImageData(imageDataArgs);
};

type CreateGatsbyImageDataFieldConfigConfig = {
	schema: gatsby.NodePluginSchema;
};

export const createGatsbyImageDataFieldConfig = (
	config: CreateGatsbyImageDataFieldConfigConfig,
) => {
	return config.schema.buildObjectType({
		name: "ImgixLiteGatsbyImageData",
	});
	return gatsbyPluginImageGraphQLUtils.getGatsbyImageResolver(
		resolveGatsbyImageData,
	);
};
