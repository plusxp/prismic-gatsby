import * as gatsby from "gatsby";

type BuildImgixGatsbyImageDataPlaceholderEnumConfig = {
	schema: gatsby.NodePluginSchema;
};

export const buildImgixGatsbyImageDataPlaceholderEnum = (
	config: BuildImgixGatsbyImageDataPlaceholderEnumConfig,
) => {
	return config.schema.buildEnumType({
		name: "ImgixLiteGatsbyImageDataPlaceholder",
		values: {
			blurred: { value: "blurred" },
			none: { value: "none" },
		},
	});
};
